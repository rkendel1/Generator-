from sqlalchemy.orm import Session
from models import Repo, Idea
import logging

# Set up logging
logger = logging.getLogger(__name__)

def get_or_create_repo(db: Session, repo_data: dict):
    """Get or create a repository with error handling"""
    try:
        if not repo_data.get("url"):
            raise ValueError("Repository URL is required")
            
        repo = db.query(Repo).filter(Repo.url == repo_data["url"]).first()
        if repo:
            # Update existing repo
            for k, v in repo_data.items():
                if hasattr(repo, k):
                    setattr(repo, k, v)
            logger.debug(f"Updated existing repo: {repo.name}")
        else:
            # Create new repo
            repo = Repo(**repo_data)
            db.add(repo)
            logger.debug(f"Created new repo: {repo.name}")
        return repo
    except Exception as e:
        logger.error(f"Error in get_or_create_repo: {e}")
        raise

def list_repos(db: Session, lang=None, search=None):
    """List repositories with filtering and error handling"""
    try:
        query = db.query(Repo)
        if lang:
            query = query.filter(Repo.language == lang)
        if search:
            query = query.filter(Repo.name.ilike(f"%{search}%"))
        return query.order_by(Repo.created_at.desc()).all()
    except Exception as e:
        logger.error(f"Error listing repos: {e}")
        raise

def get_ideas_for_repo(db: Session, repo_id: str):
    """Get ideas for a specific repository with error handling"""
    try:
        if not repo_id:
            raise ValueError("Repository ID is required")
            
        ideas = db.query(Idea).filter(Idea.repo_id == repo_id).all()
        logger.debug(f"Found {len(ideas)} ideas for repo {repo_id}")
        return ideas
    except Exception as e:
        logger.error(f"Error getting ideas for repo {repo_id}: {e}")
        raise

def create_ideas(db: Session, repo_id: str, ideas_list: list):
    """Create multiple ideas with error handling"""
    try:
        if not repo_id:
            raise ValueError("Repository ID is required")
        if not ideas_list:
            logger.warning("No ideas provided to create")
            return []
            
        ideas = []
        for idea_data in ideas_list:
            try:
                if 'mvp_effort' in idea_data and not isinstance(idea_data['mvp_effort'], int):
                    idea_data['mvp_effort'] = None
                if 'score' in idea_data and not isinstance(idea_data['score'], int):
                    idea_data['score'] = None
                idea = Idea(repo_id=repo_id, **idea_data)
                ideas.append(idea)
            except Exception as e:
                logger.error(f"Error creating idea: {e}")
                continue
                
        if ideas:
            db.add_all(ideas)
            logger.info(f"Created {len(ideas)} ideas for repo {repo_id}")
        return ideas
    except Exception as e:
        logger.error(f"Error creating ideas for repo {repo_id}: {e}")
        raise

def request_deep_dive(db: Session, idea_id: str):
    """Request deep dive for an idea with error handling"""
    try:
        if not idea_id:
            raise ValueError("Idea ID is required")
            
        idea = db.query(Idea).filter(Idea.id == idea_id).first()
        if not idea:
            raise ValueError(f"Idea with ID {idea_id} not found")
            
        idea.deep_dive_requested = True
        logger.info(f"Marked deep dive as requested for idea {idea_id}")
        return True
    except Exception as e:
        logger.error(f"Error requesting deep dive for idea {idea_id}: {e}")
        raise

def save_deep_dive(db: Session, idea_id: str, deep_dive_data: dict):
    """Save deep dive data for an idea with error handling"""
    try:
        if not idea_id:
            raise ValueError("Idea ID is required")
        if not deep_dive_data:
            raise ValueError("Deep dive data is required")
            
        idea = db.query(Idea).filter(Idea.id == idea_id).first()
        if not idea:
            raise ValueError(f"Idea with ID {idea_id} not found")
            
        idea.deep_dive = deep_dive_data
        idea.deep_dive_requested = False
        logger.info(f"Saved deep dive data for idea {idea_id}")
        return True
    except Exception as e:
        logger.error(f"Error saving deep dive for idea {idea_id}: {e}")
        raise
