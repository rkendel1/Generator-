from models import Idea
import logging
from app.schemas import IdeaOut
import os
try:
    import redis
except ImportError:
    redis = None

redis_client = None
if redis:
    try:
        redis_client = redis.Redis.from_url(os.environ.get('REDIS_URL', 'redis://localhost:6379/0'))
    except Exception:
        redis_client = None

class IdeaService:
    def __init__(self, event_bus):
        self.event_bus = event_bus
        self.logger = logging.getLogger(__name__)
        self.event_bus.subscribe('idea.status.updated', self._on_status_updated)

    def update_status(self, db, idea_id: str, new_status: str):
        idea = db.query(Idea).filter(Idea.id == idea_id).first()
        if not idea:
            raise ValueError(f"Idea with ID {idea_id} not found")
        idea.status = new_status
        db.commit()
        db.refresh(idea)
        self.logger.info(f"Updated status for idea {idea_id} to {new_status}")
        # Emit event
        self.event_bus.emit('idea.status.updated', idea_id=idea_id, new_status=new_status, db=db)
        return idea

    def _on_status_updated(self, idea_id, new_status, db, **kwargs):
        self.logger.info(f"Event received: idea.status.updated for {idea_id} -> {new_status}")
        idea = db.query(Idea).filter(Idea.id == idea_id).first()
        if not idea:
            return
        # Invalidate cache for this repo's ideas
        if redis_client and idea.repo_id:
            cache_key = f"ideas:repo:{idea.repo_id}"
            redis_client.delete(cache_key)
            self.logger.info(f"Invalidated cache for {cache_key}")
        if new_status == 'deep_dive':
            self.logger.info(f"Triggering deep dive for idea {idea_id} due to status change.")
            from crud import request_deep_dive
            request_deep_dive(db, idea_id) 