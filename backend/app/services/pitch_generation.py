import httpx
import asyncio
from app.db import get_session
from app.models import Repo, Idea
from app.llm import generate_idea_pitches  # This uses your Groq LLM logic

LANGUAGES = ["Python", "TypeScript", "JavaScript"]

async def fetch_trending(language: str):
    async with httpx.AsyncClient() as client:
        url = f"https://ghapi.huchen.dev/repositories?language={language}&since=daily"
        res = await client.get(url)
        return res.json()

async def run_nightly_pipeline():
    session = get_session()
    for lang in LANGUAGES:
        repos = await fetch_trending(lang)
        for repo_data in repos:
            existing = session.query(Repo).filter_by(name=repo_data["name"]).first()
            if existing:
                continue

            repo = Repo(
                name=repo_data["name"],
                url=repo_data["url"],
                description=repo_data["description"],
                language=repo_data["language"],
            )
            session.add(repo)
            session.commit()

            ideas = await generate_idea_pitches(repo.description)
            for idea in ideas:
                session.add(Idea(
                    repo_id=repo.id,
                    title=idea["title"],
                    hook=idea["hook"],
                    score=idea["score"],
                    mvp_effort=idea["mvp_effort"],
                    full_response=idea
                ))
            session.commit()
