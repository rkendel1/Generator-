import asyncio
from app.db import SessionLocal
from app.services.github import fetch_trending
from app.utils import save_repos
from models import Repo, Idea
from llm import generate_idea_pitches

LANGUAGES = ["Python", "TypeScript", "JavaScript"]

def main():
    session = SessionLocal()
    try:
        # 1. Fetch and save repos for each language
        for lang in LANGUAGES:
            print(f"🔍 Fetching trending repos for {lang}...")
            repos_data = asyncio.run(fetch_trending(lang))
            save_repos(repos_data, session)
            print(f"✅ Saved trending repos for {lang}.")

        # 2. Query repos from DB (now they have IDs)
        repos = session.query(Repo).all()
        print(f"✨ Generating ideas for {len(repos)} repos...")
        for repo in repos:
            print(f"  → Generating ideas for: {repo.name}")
            ideas = asyncio.run(generate_idea_pitches(repo.summary))
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
            session.commit()
            print(f"    ✔️ Ideas saved for: {repo.name}")
        print("🎉 All ideas generated and saved!")
    except Exception as e:
        print(f"❌ Error: {e}")
        session.rollback()
        raise
    finally:
        session.close()

if __name__ == "__main__":
    main() 