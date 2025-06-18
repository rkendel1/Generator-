# backend/app/routers/repos.py

from fastapi import APIRouter, Query, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db import get_db
from models import Repo
from app.schemas import RepoOut
from app.services.github import fetch_trending
from app.utils import save_repos
import logging

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/repos", tags=["repos"])


@router.get("/", response_model=List[RepoOut])
def list_repos(
    period: str = Query("daily", enum=["daily", "weekly", "monthly"]),
    language: Optional[str] = None,
    min_score: Optional[int] = None,
    db: Session = Depends(get_db)
):
    try:
        query = db.query(Repo).filter(Repo.trending_period == period)
        if language:
            query = query.filter(Repo.language.ilike(language))
        if min_score is not None:
            query = query.filter(Repo.score >= min_score)
        return query.all()
    except Exception as e:
        logger.error(f"Error fetching repositories: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch repositories")


@router.post("/load")
async def load_trending(
    period: str = Query("weekly", enum=["daily", "weekly", "monthly"]),
    db: Session = Depends(get_db)
):
    try:
        langs = ["Python", "TypeScript", "JavaScript", "Rust", "Go", "Ruby"]
        all_loaded = 0
        errors = []

        for lang in langs:
            try:
                repos = await fetch_trending(lang, period)
                if repos:
                    loaded = save_repos(repos, db=db, period=period)
                    all_loaded += loaded
                    logger.info(f"Loaded {loaded} repos for {lang}")
                else:
                    logger.warning(f"No repos found for {lang}")
            except Exception as e:
                error_msg = f"Failed to load repos for {lang}: {str(e)}"
                logger.error(error_msg)
                errors.append(error_msg)

        response = {"status": "ok", "loaded": all_loaded, "period": period}
        if errors:
            response["errors"] = errors
            response["status"] = "partial"
            
        return response
        
    except Exception as e:
        logger.error(f"Error in load_trending: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to load trending repos: {str(e)}")


@router.get("/languages", response_model=List[str])
def list_languages(db: Session = Depends(get_db)):
    try:
        langs = db.query(Repo.language).distinct().all()
        return [lang[0] for lang in langs if lang[0]]
    except Exception as e:
        logger.error(f"Error fetching languages: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch languages")
