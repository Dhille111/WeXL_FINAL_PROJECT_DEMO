from typing import Dict
from loguru import logger
from services.bot_runner import VoiceBotInstance

class SessionManager:
    def __init__(self):
        self.active_sessions: Dict[str, VoiceBotInstance] = {}

    def register_session(self, session_id: str, bot_instance: VoiceBotInstance):
        self.active_sessions[session_id] = bot_instance
        logger.info(f"Registered active session: {session_id}. Active sessions count: {len(self.active_sessions)}")

    async def stop_session(self, session_id: str) -> dict:
        if session_id not in self.active_sessions:
            logger.warning(f"Session {session_id} not found in active registry.")
            return {"status": "NOT_FOUND", "duration_seconds": 0, "input_tokens": 0, "output_tokens": 0}

        bot_instance = self.active_sessions[session_id]
        analytics = await bot_instance.stop()
        del self.active_sessions[session_id]
        logger.info(f"Terminated and unregistered session: {session_id}. Remaining active: {len(self.active_sessions)}")
        
        return {
            "status": "STOPPED",
            "duration_seconds": analytics.get("duration_seconds", 0),
            "input_tokens": analytics.get("input_tokens", 0),
            "output_tokens": analytics.get("output_tokens", 0)
        }

    def get_session(self, session_id: str) -> Optional[VoiceBotInstance]:
        return self.active_sessions.get(session_id)

# Global singleton
session_manager = SessionManager()
