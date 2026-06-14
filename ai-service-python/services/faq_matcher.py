import os
import json
import httpx
from pathlib import Path
from loguru import logger
from typing import List, Dict, Any

class FAQMatcher:
    def __init__(self, fallback_path: str = "../predefined_qa.json"):
        self.fallback_path = Path(fallback_path)
        self.spring_boot_url = os.getenv("SPRING_BOOT_URL", "http://backend-springboot:8080")

    async def get_faqs(self) -> List[Dict[str, Any]]:
        # Try to load FAQs from Spring Boot first
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                response = await client.get(f"{self.spring_boot_url}/api/faqs")
                if response.status_code == 200:
                    logger.info("Successfully fetched FAQs from Spring Boot")
                    return response.json()
        except Exception as e:
            logger.warning(f"Could not load FAQs from Spring Boot: {e}. Falling back to local file.")

        # Fall back to local predefined_qa.json
        if not self.fallback_path.exists():
            # Check if it is in the root directory relative to current directory
            root_qa_path = Path("predefined_qa.json")
            if root_qa_path.exists():
                self.fallback_path = root_qa_path
            else:
                logger.error(f"No FAQ file found at {self.fallback_path}")
                return []

        try:
            data = json.loads(self.fallback_path.read_text(encoding="utf-8"))
            entries = data.get("entries", [])
            logger.info(f"Loaded {len(entries)} FAQs from local file: {self.fallback_path}")
            return entries
        except Exception as e:
            logger.error(f"Failed to read local FAQ file: {e}")
            return []

    async def find_match(self, query: str) -> Optional[Dict[str, Any]]:
        query_clean = query.strip().lower()
        if not query_clean:
            return None

        entries = await self.get_faqs()
        for entry in entries:
            question = entry.get("question", "").strip().lower()
            if query_clean == question:
                return entry
            
            aliases = entry.get("aliases") or []
            if isinstance(aliases, str):
                aliases = [aliases]
            for alias in aliases:
                if query_clean == alias.strip().lower():
                    return entry
        return None
