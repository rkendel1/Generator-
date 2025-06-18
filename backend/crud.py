from sqlalchemy import select, update
from .models import Repo, Idea

async def get_or_create_repo(db, repo_data):
    result = await db.execute(select(Repo).where(Repo.url == repo_data["url"]))
    repo = result.scalars().first()
    if repo:
        for k,v in repo_data.items(): setattr(repo, k, v)
    else:
        repo = Repo(**repo_data)
        db.add(repo)
    return repo

async def list_repos(db, lang=None, search=None):
    q = select(Repo)
    if lang: q = q.where(Repo.language == lang)
    if search: q = q.where(Repo.name.ilike(f"%{search}%"))
    return (await db.execute(q.order_by(Repo.created_at.desc()))).scalars().all()

async def get_ideas_for_repo(db, repo_id):
    return (await db.execute(select(Idea).where(Idea.repo_id == repo_id))).scalars().all()

async def create_ideas(db, repo_id, ideas_list):
    ob = [Idea(repo_id=repo_id, **idea) for idea in ideas_list]
    db.add_all(ob); return ob

async def request_deep_dive(db, idea_id):
    await db.execute(update(Idea).where(Idea.id==idea_id).values(deep_dive_requested=True))
    return True

async def save_deep_dive(db, idea_id, deep):
    await db.execute(update(Idea).where(Idea.id==idea_id).values(deep_dive=deep, deep_dive_requested=False))
    return True
