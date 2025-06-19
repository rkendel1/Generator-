from sqlalchemy.orm import Session
from models import Repo, Idea, Shortlist, DeepDiveVersion
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

def save_deep_dive(db: Session, idea_id: str, deep_dive_data: dict, raw_blob: str = None):
    """Save deep dive data and raw LLM response for an idea with error handling"""
    try:
        if not idea_id:
            raise ValueError("Idea ID is required")
        if not deep_dive_data:
            raise ValueError("Deep dive data is required")
        idea = db.query(Idea).filter(Idea.id == idea_id).first()
        if not idea:
            raise ValueError(f"Idea with ID {idea_id} not found")
        idea.deep_dive = deep_dive_data
        if raw_blob is not None:
            idea.deep_dive_raw_response = raw_blob
        idea.deep_dive_requested = False
        logger.info(f"Saved deep dive data for idea {idea_id}")
        return True
    except Exception as e:
        logger.error(f"Error saving deep dive for idea {idea_id}: {e}")
        raise

def add_to_shortlist(db: Session, idea_id: str):
    if not db.query(Shortlist).filter(Shortlist.idea_id == idea_id).first():
        shortlist = Shortlist(idea_id=idea_id)
        db.add(shortlist)
        db.commit()
        db.refresh(shortlist)
        return shortlist
    return None

def remove_from_shortlist(db: Session, idea_id: str):
    shortlist = db.query(Shortlist).filter(Shortlist.idea_id == idea_id).first()
    if shortlist:
        db.delete(shortlist)
        db.commit()
        return True
    return False

def get_shortlist_ideas(db: Session):
    return db.query(Shortlist).all()

def create_deep_dive_version(db: Session, idea_id: str, fields: dict, llm_raw_response: str):
    # Find the next version number for this idea
    last = db.query(DeepDiveVersion).filter(DeepDiveVersion.idea_id == idea_id).order_by(DeepDiveVersion.version_number.desc()).first()
    next_version = 1 if not last else last.version_number + 1
    version = DeepDiveVersion(
        idea_id=idea_id,
        version_number=next_version,
        fields=fields,
        llm_raw_response=llm_raw_response
    )
    db.add(version)
    db.commit()
    db.refresh(version)
    return version

def get_deep_dive_versions(db: Session, idea_id: str):
    return db.query(DeepDiveVersion).filter(DeepDiveVersion.idea_id == idea_id).order_by(DeepDiveVersion.version_number.desc()).all()

def get_deep_dive_version(db: Session, idea_id: str, version_number: int):
    return db.query(DeepDiveVersion).filter(DeepDiveVersion.idea_id == idea_id, DeepDiveVersion.version_number == version_number).first()

def restore_deep_dive_version(db: Session, idea_id: str, version_number: int):
    version = get_deep_dive_version(db, idea_id, version_number)
    if not version:
        return None
    idea = db.query(Idea).filter(Idea.id == idea_id).first()
    if not idea:
        return None
    idea.deep_dive = version.fields
    idea.deep_dive_raw_response = version.llm_raw_response
    db.commit()
    return idea

def update_idea_status(db: Session, idea_id: str, new_status: str):
    """Update the status of an idea."""
    idea = db.query(Idea).filter(Idea.id == idea_id).first()
    if not idea:
        raise ValueError(f"Idea with ID {idea_id} not found")
    idea.status = new_status
    db.commit()
    db.refresh(idea)
    return idea
