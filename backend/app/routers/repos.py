# backend/app/routers/repos.py

from fastapi import APIRouter, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db import get_db
from app.models import Repo
from app.schemas import RepoOut
from app.services.github import fetch_trending
from app.utils import save_repos

router = APIRouter(prefix="/repos", tags=["repos"])

@router.get("/", response_model=List[RepoOut])
def list_repos(
    period: str = Query("daily", enum=["daily", "weekly", "monthly"]),
    language: Optional[str] = None,
    min_score: Optional[int] = None,
    db: Session = get_db()
):
    query = db.query(Repo).filter(Repo.trending_period == period)
    if language:
        query = query.filter(Repo.language.ilike(language))
    if min_score is not None:
        query = query.filter(Repo.score >= min_score)
    return query.all()


@router.post("/load")
async def load_trending(
    period: str = Query("weekly", enum=["daily", "weekly", "monthly"]),
    db: Session = get_db()
):
    langs = ["Python", "TypeScript", "JavaScript", "Rust", "Go", "Ruby"]
    all_loaded = 0

    for lang in langs:
        repos = await fetch_trending(lang, period)
        loaded = save_repos(repos, db=db, period=period)
        all_loaded += loaded

    return {"status": "ok", "loaded": all_loaded, "period": period}


@router.get("/languages", response_model=List[str])
def list_languages(db: Session = get_db()):
    langs = db.query(Repo.language).distinct().all()
    return [lang[0] for lang in langs]
