import os
import httpx
import asyncio
from typing import Dict, Any, Optional
from loguru import logger
from pipecat.pipeline.pipeline import Pipeline
from pipecat.pipeline.runner import PipelineRunner
from pipecat.pipeline.task import PipelineParams, PipelineTask
from pipecat.services.google.gemini_live.llm import GeminiLiveLLMService, InputParams, GeminiVADParams
from pipecat.transports.services.daily import DailyTransport, DailyTransportParams

DAILY_API_URL = "https://api.daily.co/v1"

class DailyRoomService:
    def __init__(self):
        self.api_key = os.getenv("DAILY_API_KEY", "")

    async def create_room(self, session_id: str) -> Dict[str, Any]:
        """Creates a Daily WebRTC room valid for 1 hour."""
        if not self.api_key:
            logger.warning("DAILY_API_KEY is not set. Generating a mock room URL for demo fallback.")
            return {
                "url": f"https://mock.daily.co/session-{session_id}",
                "name": f"session-{session_id}"
            }

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        data = {
            "name": f"voice-{session_id}",
            "properties": {
                "exp": int(asyncio.get_event_loop().time()) + 3600, # Expire in 1 hour
                "enable_chat": True,
                "enable_recording": "cloud"
            }
        }

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(f"{DAILY_API_URL}/rooms", json=data, headers=headers, timeout=5.0)
                if response.status_code in (200, 201):
                    return response.json()
                elif response.status_code == 409:
                    # Room already exists, fetch it
                    get_resp = await client.get(f"{DAILY_API_URL}/rooms/voice-{session_id}", headers=headers)
                    return get_resp.json()
                else:
                    logger.error(f"Failed to create Daily room: {response.text}")
            except Exception as e:
                logger.error(f"Exception during Daily room creation: {e}")
        
        # Fallback in case of failure
        return {
            "url": f"https://mock.daily.co/session-{session_id}",
            "name": f"session-{session_id}"
        }

    async def create_token(self, room_name: str, is_owner: bool = False) -> str:
        """Generates a participant token to access a private Daily room."""
        if not self.api_key:
            return "mock-token"

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        data = {
            "properties": {
                "room_name": room_name,
                "is_owner": is_owner,
                "user_name": "AI Assistant" if is_owner else "User"
            }
        }

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(f"{DAILY_API_URL}/meeting-tokens", json=data, headers=headers, timeout=5.0)
                if response.status_code == 200:
                    return response.json().get("token", "")
            except Exception as e:
                logger.error(f"Failed to generate Daily token: {e}")
        return "mock-token"


class VoiceBotInstance:
    def __init__(self, session_id: str, room_url: str, token: str, system_instruction: str):
        self.session_id = session_id
        self.room_url = room_url
        self.token = token
        self.system_instruction = system_instruction
        self._runner = None
        self._task = None
        self.spring_boot_url = os.getenv("SPRING_BOOT_URL", "http://backend-springboot:8080")

    async def start(self):
        # Configure the production transport
        transport = DailyTransport(
            room_url=self.room_url,
            token=self.token,
            bot_name="NEC AI Voice Assistant",
            params=DailyTransportParams(
                audio_in_enabled=True,
                audio_out_enabled=True,
                camera_in_enabled=False,
                camera_out_enabled=False
            )
        )

        llm = GeminiLiveLLMService(
            api_key=os.getenv("GOOGLE_API_KEY", ""),
            voice_id="Puck",
            system_instruction=self.system_instruction,
            params=InputParams(
                vad=GeminiVADParams(
                    silence_duration_ms=200
                )
            )
        )

        # Connect the Daily audio input directly to Gemini, and Gemini audio output back to Daily
        pipeline = Pipeline([
            transport.input(),
            llm,
            transport.output()
        ])

        task = PipelineTask(
            pipeline,
            params=PipelineParams(
                enable_metrics=True,
                enable_usage_metrics=True,
            ),
        )

        # Track speech and print transcriptions
        @transport.event_handler("on_participant_joined")
        async def on_participant_joined(transport, participant):
            logger.info(f"Session {self.session_id}: Participant {participant['id']} joined WebRTC room")

        # Capture transcript events and post them to Spring Boot database
        @llm.event_handler("on_user_transcript")
        async def on_user_transcript(llm, text):
            logger.info(f"User transcript: {text}")
            await self._save_message_to_db("USER", text)

        @llm.event_handler("on_bot_transcript")
        async def on_bot_transcript(llm, text):
            logger.info(f"AI transcript: {text}")
            await self._save_message_to_db("ASSISTANT", text)

        self._runner = PipelineRunner()
        self._task = asyncio.create_task(self._runner.run(task))
        logger.info(f"VoiceBotInstance for session {self.session_id} is running in background.")

    async def stop(self) -> Dict[str, Any]:
        logger.info(f"Stopping VoiceBotInstance for session {self.session_id}")
        if self._runner:
            await self._runner.stop()
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        
        # Return summary analytics (mocked for demo purposes)
        return {
            "duration_seconds": 45,
            "input_tokens": 120,
            "output_tokens": 350
        }

    async def _save_message_to_db(self, role: str, content: str):
        """Asynchronously post transcripts back to Spring Boot database store."""
        data = {
            "role": role,
            "content": content
        }
        headers = {"Content-Type": "application/json"}
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.post(
                    f"{self.spring_boot_url}/api/chat/message?sessionId={self.session_id}",
                    json=data,
                    headers=headers,
                    timeout=3.0
                )
                if resp.status_code != 200:
                    logger.warning(f"Failed to save message to database: {resp.text}")
        except Exception as e:
            logger.error(f"Error connecting to database to save message: {e}")
