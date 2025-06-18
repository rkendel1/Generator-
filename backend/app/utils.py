# backend/app/utils.py

from app.models import Repo
from sqlalchemy.orm import Session

def save_repos(repos, db: Session, period: str = "daily") -> int:
    saved = 0
    for r in repos:
        exists = db.query(Repo).filter_by(url=r["url"], trending_period=period).first()
        if exists:
            continue
        repo = Repo(
            name=r["name"],
            url=r["url"],
            description=r.get("description", "")[:500],
            language=r.get("language", "Unknown"),
            trending_period=period
        )
        db.add(repo)
        saved += 1
    db.commit()
    return saved
