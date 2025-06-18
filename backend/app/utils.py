# backend/app/utils.py

from models import Repo
from sqlalchemy.orm import Session
import logging
import httpx
import asyncio

# Set up logging
logger = logging.getLogger(__name__)

async def translate_to_english(text: str) -> str:
    """Translate text to English using LibreTranslate API. Returns original text on failure."""
    if not text:
        return text
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                "https://libretranslate.de/translate",
                data={
                    "q": text,
                    "source": "auto",
                    "target": "en",
                    "format": "text"
                },
                headers={"accept": "application/json"}
            )
            response.raise_for_status()
            translated = response.json().get("translatedText", "")
            return translated if translated else text
    except Exception as e:
        logger.warning(f"Translation failed: {e}")
        return text

def save_repos(repos, db: Session, period: str = "daily") -> int:
    """Save repositories to database with error handling and description translation"""
    saved = 0
    errors = []
    
    if not repos:
        logger.warning("No repos provided to save")
        return 0
    
    for i, r in enumerate(repos):
        try:
            # Validate required fields
            if not r.get("name") or not r.get("url"):
                logger.warning(f"Repo {i} missing required fields: name={r.get('name')}, url={r.get('url')}")
                continue
            
            # Check if repo already exists
            exists = db.query(Repo).filter_by(url=r["url"], trending_period=period).first()
            if exists:
                logger.debug(f"Repo {r['name']} already exists, skipping")
                continue
            
            # Translate description to English before saving
            description = r.get("description", "")
            if description:
                try:
                    description = asyncio.run(translate_to_english(description))
                except Exception as e:
                    logger.warning(f"Async translation failed, using original: {e}")
            
            # Create new repo
            repo = Repo(
                name=r["name"],
                url=r["url"],
                summary=description[:500] if description else None,
                language=r.get("language", "Unknown"),
                trending_period=period
            )
            db.add(repo)
            saved += 1
            logger.debug(f"Added repo: {r['name']}")
            
        except Exception as e:
            error_msg = f"Error saving repo {r.get('name', 'unknown')}: {str(e)}"
            logger.error(error_msg)
            errors.append(error_msg)
            continue
    
    try:
        db.commit()
        logger.info(f"Successfully saved {saved} new repositories")
        if errors:
            logger.warning(f"Encountered {len(errors)} errors while saving repos")
    except Exception as e:
        logger.error(f"Error committing repos to database: {e}")
        db.rollback()
        raise
    
    return saved
