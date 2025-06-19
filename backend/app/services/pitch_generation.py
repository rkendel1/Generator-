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
        all_repos = []
        for lang in LANGUAGES:
            print(f"🔍 Fetching trending repos for {lang}...")
            repos = await fetch_trending(lang)
            all_repos.extend(repos)
        print(f"✨ Total repos to process: {len(all_repos)}")
        for idx, repo_data in enumerate(all_repos):
            print(f"[{idx+1}/{len(all_repos)}] Processing repo: {repo_data['name']}")
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
                session.commit()  # Commit the repo immediately so it always appears in the DB/UI
            # Robust idea generation with retries
            max_attempts = 5
            for attempt in range(1, max_attempts + 1):
                try:
                    print(f"    Attempt {attempt} to generate ideas...")
                    result = await generate_idea_pitches(repo.summary)
                    raw_blob = result.get('raw')
                    ideas = result.get('ideas', [])
                    if ideas and isinstance(ideas, list) and any(i.get('title') for i in ideas):
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
                                llm_raw_response=raw_blob
                            ))
                        session.commit()
                        print(f"    ✔️ Ideas saved for: {repo.name} (count: {len(ideas)})")
                        break
                    else:
                        # Save the blob even if parsing fails, for debugging
                        session.add(Idea(
                            repo_id=repo.id,
                            title=f"[ERROR] No ideas parsed (see llm_raw_response)",
                            hook=None,
                            value=None,
                            evidence=None,
                            differentiator=None,
                            call_to_action=None,
                            score=None,
                            mvp_effort=None,
                            llm_raw_response=raw_blob
                        ))
                        session.commit()
                        print(f"    [WARN] No ideas returned. Saved raw blob for debugging.")
                except Exception as idea_err:
                    print(f"    [ERROR] Failed to generate ideas for {repo.name} (attempt {attempt}): {idea_err}")
                await asyncio.sleep(3)  # Short delay between attempts
            else:
                print(f"    ❌ Failed to generate ideas for {repo.name} after {max_attempts} attempts.")
            print("    ⏳ Waiting 1 second before next repo...")
            await asyncio.sleep(1)
        print("🎉 All ideas generated and saved!")
    except Exception as err:
        print(f"[CRITICAL] Pipeline failed: {err}")
    finally:
        session.close()

if __name__ == "__main__":
    asyncio.run(run_nightly_pipeline())