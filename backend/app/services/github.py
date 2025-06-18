# backend/app/services/github.py

import httpx
import logging
from typing import List, Dict, Any

# Set up logging
logger = logging.getLogger(__name__)

async def fetch_trending(language: str, period: str = "daily") -> List[Dict[str, Any]]:
    """
    Fetch trending repositories from the GitHub Trending API JSON feed and map to backend Repo model.
    """
    try:
        url = "https://raw.githubusercontent.com/isboyjc/github-trending-api/main/data/daily/all.json"
        logger.info(f"Fetching trending repos for {language} from {url}")
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url)
            response.raise_for_status()
            data = response.json()
            items = data.get("items", [])

            # Filter by language (case-insensitive)
            filtered = [
                {
                    "name": item.get("title", ""),
                    "url": item.get("url", ""),
                    "description": item.get("description", ""),
                    "language": item.get("language", "Unknown"),
                }
                for item in items
                if item.get("language", "").lower() == language.lower()
            ]
            logger.info(f"Found {len(filtered)} trending repos for language: {language}")
            return filtered
    except Exception as e:
        logger.error(f"Error fetching trending repos for {language}: {e}")
        return []
