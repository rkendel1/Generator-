from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db import get_db
from models import Idea
from app.schemas import IdeaOut
from crud import get_ideas_for_repo, request_deep_dive, save_deep_dive
from llm import generate_deep_dive
import logging

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/repo/{repo_id}", response_model=List[IdeaOut])
def list_by_repo(repo_id: str, db: Session = Depends(get_db)):
    try:
        return get_ideas_for_repo(db, repo_id)
    except Exception as e:
        logger.error(f"Error fetching ideas for repo {repo_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch ideas: {str(e)}")

@router.post("/{idea_id}/deepdive")
async def trigger_deepdive(idea_id: str, db: Session = Depends(get_db)):
    try:
        logger.error(f"🔍 DEBUG: trigger_deepdive called for idea {idea_id}")
        
        # Get the idea data
        idea = db.query(Idea).filter(Idea.id == idea_id).first()
        if not idea:
            raise HTTPException(status_code=404, detail="Idea not found")
        
        logger.error(f"🔍 DEBUG: Found idea: {idea.title}")
        logger.error(f"🔍 DEBUG: idea.deep_dive exists: {bool(idea.deep_dive)}")
        logger.error(f"🔍 DEBUG: idea.deep_dive_requested: {idea.deep_dive_requested}")
        
        # Check if deep dive already exists
        if idea.deep_dive and not idea.deep_dive_requested:
            logger.error(f"🔍 DEBUG: Returning cached deep dive")
            return {"status": "completed", "deep_dive": idea.deep_dive}
        
        # Mark as requested
        request_deep_dive(db, idea_id)
        db.commit()
        
        # Prepare idea data for deep dive generation
        idea_data = {
            "title": idea.title,
            "hook": idea.hook,
            "value": idea.value,
            "evidence": idea.evidence,
            "differentiator": idea.differentiator,
            "call_to_action": idea.call_to_action,
            "score": idea.score,
            "mvp_effort": idea.mvp_effort
        }
        
        logger.error(f"🔍 DEBUG: Prepared idea_data: {idea_data}")
        
        # Generate the deep dive synchronously
        logger.info(f"Generating deep dive for idea {idea_id}")
        logger.error(f"🔍 DEBUG: About to call generate_deep_dive...")
        
        try:
            deep_dive_result = await generate_deep_dive(idea_data)
            logger.error(f"🔍 DEBUG: generate_deep_dive returned: {deep_dive_result}")
        except Exception as e:
            logger.error(f"🔍 DEBUG: Exception in generate_deep_dive: {e}")
            raise
        
        # Save the result to database
        save_deep_dive(db, idea_id, deep_dive_result)
        db.commit()
        
        logger.info(f"Deep dive generated successfully for idea {idea_id}")
        
        return {
            "status": "completed", 
            "deep_dive": deep_dive_result,
            "message": "Deep dive analysis completed"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating deep dive for idea {idea_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate deep dive: {str(e)}")
