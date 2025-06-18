import httpx
import asyncio
from app.db import SessionLocal
from models import Repo, Idea
from llm import generate_idea_pitches
from app.services.github import fetch_trending

LANGUAGES = ["Python", "TypeScript", "JavaScript"]

async def run_nightly_pipeline():
    session = SessionLocal()
    try:
        for lang in LANGUAGES:
            print(f"🔍 Fetching trending repos for {lang}...")
            repos = await fetch_trending(lang)
            for repo_data in repos:
                # Always generate and store new ideas for every trending repo, even if it already exists
                existing_repo = session.query(Repo).filter_by(name=repo_data["name"]).first()
                if existing_repo:
                    repo = existing_repo
                else:
                    repo = Repo(
                        name=repo_data["name"],
                        url=repo_data["url"],
                        summary=repo_data.get("description", "")[:500] or "No description provided.",
                        language=repo_data.get("language", "Unknown"),
                    )
                    session.add(repo)
                    session.flush()  # allows repo.id to be available before commit

                print(f"✨ Processing repo: {repo.name}")

                try:
                    ideas = await generate_idea_pitches(repo.summary)
                    for idea in ideas:
                        mvp_effort = idea.get("mvp_effort")
                        if not isinstance(mvp_effort, int):
                            mvp_effort = None
                        score = idea.get("score")
                        if not isinstance(score, int):
                            score = None
                        session.add(Idea(
                            repo_id=repo.id,
                            title=idea.get("title", ""),
                            hook=idea.get("hook", ""),
                            value=idea.get("value", ""),
                            evidence=idea.get("evidence", ""),
                            differentiator=idea.get("differentiator", ""),
                            call_to_action=idea.get("call_to_action", ""),
                            score=score,
                            mvp_effort=mvp_effort,
                        ))
                except Exception as idea_err:
                    print(f"[ERROR] Failed to generate ideas for {repo.name}: {idea_err}")

            session.commit()
            print(f"✅ Done with language: {lang}")

    except Exception as err:
        print(f"[CRITICAL] Pipeline failed: {err}")
    finally:
        session.close()

if __name__ == "__main__":
    asyncio.run(run_nightly_pipeline())