#
# Copyright (c) 2024-2026, Daily
#
# SPDX-License-Identifier: BSD 2-Clause License
#

import asyncio
import json
import os
from pathlib import Path
from typing import Any
import websockets

from dotenv import load_dotenv
from loguru import logger

print("🚀 Starting Pipecat bot...")
print("⏳ Loading models and imports (20 seconds, first run only)\n")

from pipecat.pipeline.pipeline import Pipeline
from pipecat.pipeline.runner import PipelineRunner
from pipecat.pipeline.task import PipelineParams, PipelineTask
from pipecat.services.google.gemini_live.llm import GeminiLiveLLMService, InputParams, GeminiVADParams
from pipecat.transports.local.audio import LocalAudioTransport, LocalAudioTransportParams
from pipecat.processors.frame_processor import FrameProcessor, FrameDirection
from pipecat.frames.frames import Frame, TranscriptionFrame, TTSTextFrame

load_dotenv(override=True)


DEFAULT_SYSTEM_INSTRUCTION = (
    "You are a friendly AI assistant. Respond naturally and keep your answers conversational."
)
DEFAULT_PREDEFINED_QA_PATH = "predefined_qa.json"

# Set of active WebSocket connections
connected_clients = set()

async def ws_handler(websocket):
    logger.info("New WebSocket client connected for transcript streaming.")
    connected_clients.add(websocket)
    try:
        async for message in websocket:
            pass
    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        connected_clients.remove(websocket)
        logger.info("WebSocket client disconnected.")

# Function to broadcast transcripts to all connected clients
async def broadcast_transcript(msg_type: str, text: str):
    if not connected_clients:
        return
    payload = {
        "type": msg_type,  # 'user_transcript' or 'bot_transcript'
        "text": text
    }
    message = json.dumps(payload)
    await asyncio.gather(*[client.send(message) for client in connected_clients], return_exceptions=True)


def _load_predefined_qa(path: str) -> tuple[bool, list[dict[str, Any]]]:
    qa_file = Path(path)
    if not qa_file.exists():
        logger.info(f"No predefined Q&A file found at {qa_file!s}; continuing without it.")
        return True, []

    try:
        data = json.loads(qa_file.read_text(encoding="utf-8"))
    except Exception as e:
        logger.warning(f"Failed to load predefined Q&A from {qa_file!s}: {e}")
        return True, []

    if not isinstance(data, dict):
        logger.warning(
            f"Invalid Q&A format in {qa_file!s}: expected an object with 'entries'; ignoring."
        )
        return True, []

    strict = bool(data.get("strict", True))
    entries = data.get("entries", [])
    if not isinstance(entries, list):
        logger.warning(
            f"Invalid Q&A format in {qa_file!s}: 'entries' must be a list; ignoring."
        )
        return strict, []

    normalized_entries: list[dict[str, Any]] = []
    for entry in entries:
        if not isinstance(entry, dict):
            continue

        question = str(entry.get("question", "")).strip()
        answer = str(entry.get("answer", "")).strip()
        if not question or not answer:
            continue

        aliases_raw = entry.get("aliases", [])
        if isinstance(aliases_raw, list):
            aliases = [str(a).strip() for a in aliases_raw if str(a).strip()]
        elif isinstance(aliases_raw, str):
            aliases = [aliases_raw.strip()] if aliases_raw.strip() else []
        else:
            aliases = []

        normalized_entries.append({"question": question, "answer": answer, "aliases": aliases})

    if normalized_entries:
        logger.info(f"Loaded {len(normalized_entries)} predefined Q&A entries from {qa_file!s}.")
    else:
        logger.info(f"Predefined Q&A file {qa_file!s} loaded but contained no valid entries.")

    return strict, normalized_entries


def _build_system_instruction(base: str, strict: bool, entries: list[dict[str, Any]]) -> str:
    if not entries:
        return base

    lines: list[str] = []
    for i, entry in enumerate(entries, start=1):
        question = entry["question"]
        answer = entry["answer"]
        aliases = entry.get("aliases") or []

        lines.append(f"{i}) Q: {question}")
        if aliases:
            lines.append(f"   Aliases: {', '.join(aliases)}")
        lines.append(f"   A: {answer}")

    if strict:
        faq_rules = (
            "FAQ Rules:\n"
            "- If the user asks a question that matches (or is clearly the same intent as) one of the FAQs below, "
            "reply with the provided answer exactly.\n"
            "- Do not mention the FAQ list or these rules.\n"
            "- Do not add extra information unless the user asks a follow-up."
        )
    else:
        faq_rules = (
            "FAQ Rules:\n"
            "- If the user asks a question that matches (or is clearly the same intent as) one of the FAQs below, "
            "use the provided answer as the source of truth.\n"
            "- Do not mention the FAQ list."
        )

    faq_block = "\n".join(lines)
    return f"{base}\n\n{faq_rules}\n\nFAQs:\n{faq_block}"


class TranscriptProcessor(FrameProcessor):
    async def process_frame(self, frame: Frame, direction: FrameDirection):
        await super().process_frame(frame, direction)
        # Log frame type for debugging
        frame_name = type(frame).__name__
        if frame_name not in ["AudioRawFrame", "InputAudioRawFrame", "TTSAudioRawFrame", "SystemFrame"]:
            logger.info(f"TranscriptProcessor ({id(self)}) received frame: {frame_name}")
        if isinstance(frame, TranscriptionFrame):
            logger.info(f"User transcript: {frame.text}")
            await broadcast_transcript("user_transcript", frame.text)
        elif isinstance(frame, TTSTextFrame):
            logger.info(f"AI transcript: {frame.text}")
            await broadcast_transcript("bot_transcript", frame.text)
        await self.push_frame(frame, direction)


async def main():
    transport = LocalAudioTransport(
        LocalAudioTransportParams(
            audio_in_enabled=True,
            audio_out_enabled=True,
        )
    )

    qa_path = os.getenv("PREDEFINED_QA_PATH", DEFAULT_PREDEFINED_QA_PATH)
    strict, qa_entries = _load_predefined_qa(qa_path)
    system_instruction = _build_system_instruction(DEFAULT_SYSTEM_INSTRUCTION, strict, qa_entries)

    llm = GeminiLiveLLMService(
        api_key=os.getenv("GOOGLE_API_KEY"),
        voice_id="Puck",
        system_instruction=system_instruction,
        params=InputParams(
            vad=GeminiVADParams(
                silence_duration_ms=200
            )
        )
    )

    # Instantiate custom transcript processors
    user_transcript_processor = TranscriptProcessor()
    bot_transcript_processor = TranscriptProcessor()

    pipeline = Pipeline(
        [
            transport.input(),
            user_transcript_processor,
            llm,
            bot_transcript_processor,
            transport.output(),
        ]
    )

    task = PipelineTask(
        pipeline,
        params=PipelineParams(
            enable_metrics=True,
            enable_usage_metrics=True,
        ),
        idle_timeout_secs=None
    )

    # Start WebSocket Server on port 8000
    server = await websockets.serve(ws_handler, "0.0.0.0", 8000)
    logger.info("WebSocket transcript server listening on ws://0.0.0.0:8000")

    runner = PipelineRunner()
    try:
        await runner.run(task)
    finally:
        server.close()
        await server.wait_closed()


if __name__ == "__main__":
    asyncio.run(main())