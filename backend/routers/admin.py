from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from ..crud import get_or_create_repo
from ..database import AsyncSessionLocal
import httpx

router = APIRouter()

def get_db():
    db=AsyncSessionLocal(); yield db; await db.close()

@router.post("/fetch-trending")
async def fetch_trending(db: AsyncSession = Depends(get_db)):
    langs = ["Python","JavaScript","TypeScript","React"]
    async with httpx.AsyncClient() as client:
        repos = ... # scrape GitHub trending API
    count=0
    for r in repos:
        await get_or_create_repo(db, r); count+=1
    await db.commit()
    return {"imported": count}
