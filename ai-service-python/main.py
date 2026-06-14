import os
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from loguru import logger
import httpx
from typing import Dict, List

from models.schemas import (
    VoiceStartRequest, VoiceStartResponse,
    VoiceStopRequest, VoiceStopResponse,
    ChatRequest, ChatResponse
)
from services.faq_matcher import FAQMatcher
from services.bot_runner import DailyRoomService, VoiceBotInstance
from services.session_manager import session_manager
from prompts.system_instructions import DEFAULT_SYSTEM_INSTRUCTION, build_system_instruction

load_dotenv(override=True)

app = FastAPI(title="Pipecat AI Voice Assistant Service")

# Setup CORS for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

faq_matcher = FAQMatcher()
room_service = DailyRoomService()

# In-memory WebSocket registry: session_id -> List[WebSocket]
websocket_registry: Dict[str, List[WebSocket]] = {}

async def broadcast_to_session(session_id: str, message_type: str, text: str):
    """Utility to broadcast transcripts to all connected WebSockets for a session."""
    websockets = websocket_registry.get(session_id, [])
    if not websockets:
        return
    
    payload = {
        "type": message_type, # 'user_transcript' or 'bot_transcript'
        "text": text
    }
    
    disconnected = []
    for ws in websockets:
        try:
            await ws.send_json(payload)
        except Exception:
            disconnected.append(ws)
            
    for ws in disconnected:
        websockets.remove(ws)
        logger.info(f"Cleaned up disconnected WS for session {session_id}")

@app.on_event("startup")
async def startup():
    logger.info("Pipecat FastAPI AI Service started.")

@app.post("/voice/start", response_model=VoiceStartResponse)
async def start_voice_session(request: VoiceStartRequest):
    logger.info(f"Start voice session requested: {request.session_id}")
    
    # 1. Fetch FAQs from DB (Spring Boot) / local JSON
    faqs = await faq_matcher.get_faqs()
    
    # 2. Compile customized system instruction including FAQs
    system_instruction = build_system_instruction(
        DEFAULT_SYSTEM_INSTRUCTION, 
        request.strict_faq, 
        faqs
    )

    # 3. Create Daily WebRTC Room
    room = await room_service.create_room(request.session_id)
    room_url = room.get("url", "")
    room_name = room.get("name", "")
    
    if not room_url:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to initialize WebRTC room."
        )

    # 4. Generate participant tokens
    # Bot joins as owner
    bot_token = await room_service.create_token(room_name, is_owner=True)
    # User joins as participant
    user_token = await room_service.create_token(room_name, is_owner=False)

    # 5. Instantiate Pipecat Bot Instance
    bot_instance = VoiceBotInstance(
        session_id=request.session_id,
        room_url=room_url,
        token=bot_token,
        system_instruction=system_instruction
    )
    
    # Overwrite the message save logic in bot_runner to also broadcast transcripts over WebSockets
    original_save = bot_instance._save_message_to_db
    async def save_and_broadcast(role: str, content: str):
        await original_save(role, content)
        msg_type = "user_transcript" if role == "USER" else "bot_transcript"
        await broadcast_to_session(request.session_id, msg_type, content)
        
    bot_instance._save_message_to_db = save_and_broadcast

    # 6. Start the pipeline in the background
    await bot_instance.start()
    
    # Register session
    session_manager.register_session(request.session_id, bot_instance)

    return VoiceStartResponse(
        session_id=request.session_id,
        room_url=room_url,
        token=user_token,
        status="ACTIVE"
    )

@app.post("/voice/stop", response_model=VoiceStopResponse)
async def stop_voice_session(request: VoiceStopRequest):
    logger.info(f"Stop voice session requested: {request.session_id}")
    
    result = await session_manager.stop_session(request.session_id)
    
    # Clean up WebSockets for this session
    if request.session_id in websocket_registry:
        for ws in websocket_registry[request.session_id]:
            try:
                await ws.close()
            except Exception:
                pass
        del websocket_registry[request.session_id]

    return VoiceStopResponse(
        session_id=request.session_id,
        status=result["status"],
        duration_seconds=result["duration_seconds"],
        input_tokens=result["input_tokens"],
        output_tokens=result["output_tokens"]
    )

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    logger.info(f"Standard chat request for session {request.session_id}")
    
    # 1. Look for matching FAQ
    match = await faq_matcher.find_match(request.message)
    if match:
        logger.info(f"FAQ Match found for query: '{request.message}'")
        return ChatResponse(
            response=match["answer"],
            matched_faq=True
        )

    # 2. If no FAQ matches, call standard Gemini API
    google_key = os.getenv("GOOGLE_API_KEY", "")
    if not google_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="GOOGLE_API_KEY environment variable is not configured."
        )

    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={google_key}"
        headers = {"Content-Type": "application/json"}
        body = {
            "contents": [{"parts": [{"text": request.message}]}],
            "systemInstruction": {"parts": [{"text": DEFAULT_SYSTEM_INSTRUCTION}]}
        }
        
        async with httpx.AsyncClient() as client:
            resp = await client.post(url, json=body, headers=headers, timeout=8.0)
            if resp.status_code == 200:
                data = resp.json()
                answer = data["candidates"][0]["content"]["parts"][0]["text"]
                return ChatResponse(response=answer, matched_faq=False)
            else:
                logger.error(f"Gemini API returned status {resp.status_code}: {resp.text}")
                raise HTTPException(status_code=502, detail="Error communicating with Gemini API")
    except Exception as e:
        logger.error(f"Exception calling Gemini: {e}")
        raise HTTPException(status_code=500, detail="Internal server error calling Gemini API")

# WebSocket routes for real-time client transcript updates
@app.websocket("/ws/transcript")
async def transcript_websocket(websocket: WebSocket, session_id: str):
    await websocket.accept()
    logger.info(f"WS client connected for transcript streaming of session: {session_id}")
    
    if session_id not in websocket_registry:
        websocket_registry[session_id] = []
    websocket_registry[session_id].append(websocket)
    
    try:
        while True:
            # Keep connection open; we only push data down this pipe
            data = await websocket.receive_text()
            logger.info(f"Received ping from client {session_id}: {data}")
    except WebSocketDisconnect:
        logger.info(f"WS client disconnected for session: {session_id}")
    finally:
        if session_id in websocket_registry and websocket in websocket_registry[session_id]:
            websocket_registry[session_id].remove(websocket)
            if not websocket_registry[session_id]:
                del websocket_registry[session_id]
