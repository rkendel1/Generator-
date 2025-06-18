from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from ..crud import get_ideas_for_repo, request_deep_dive, save_deep_dive
from ..llm import call_groq
from ..prompts import DEEP_DIVE_PROMPT

router = APIRouter()

@router.get("/repo/{repo_id}")
async def list_by_repo(repo_id: str, db: AsyncSession = Depends(...)):
    return await get_ideas_for_repo(db, repo_id)

@router.post("/{idea_id}/deepdive")
async def trigger_deepdive(idea_id: str, db: AsyncSession = Depends(...)):
    await request_deep_dive(db, idea_id); await db.commit()
    # trigger async LLM call (could be background or listener)
    return {"status": "scheduled"}
