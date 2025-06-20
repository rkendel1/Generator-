from crud import get_ideas_for_repo, request_deep_dive, save_deep_dive, add_to_shortlist, remove_from_shortlist, get_shortlist_ideas, create_deep_dive_version, get_deep_dive_versions, get_deep_dive_version, restore_deep_dive_version, update_idea_status
from app.schemas import IdeaOut, ShortlistOut, DeepDiveVersionOut
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from llm import generate_deep_dive, generate_idea_pitches
from app.db import get_db
from models import Idea

router = APIRouter()

@router.get("/shortlist", response_model=List[IdeaOut])
def get_shortlisted_ideas(db: Session = Depends(get_db)):
    shortlist = get_shortlist_ideas(db)
    idea_ids = [s.idea_id for s in shortlist]
    if not idea_ids:
        return []
    ideas = db.query(Idea).filter(Idea.id.in_(idea_ids)).all()
    # Return in the order of the shortlist
    idea_map = {idea.id: idea for idea in ideas}
    return [idea_map[iid] for iid in idea_ids if iid in idea_map]

@router.post("/{idea_id}/shortlist", response_model=ShortlistOut)
def add_idea_to_shortlist(idea_id: str, db: Session = Depends(get_db)):
    result = add_to_shortlist(db, idea_id)
    if result:
        return result
    else:
        raise HTTPException(status_code=400, detail="Already in shortlist")

@router.delete("/{idea_id}/shortlist", response_model=dict)
def remove_idea_from_shortlist(idea_id: str, db: Session = Depends(get_db)):
    removed = remove_from_shortlist(db, idea_id)
    if removed:
        return {"status": "removed"}
    else:
        raise HTTPException(status_code=404, detail="Not in shortlist")

@router.get("/{idea_id}/deepdive_versions", response_model=List[DeepDiveVersionOut])
def list_deep_dive_versions(idea_id: str, db: Session = Depends(get_db)):
    return get_deep_dive_versions(db, idea_id)

@router.post("/{idea_id}/deepdive_versions", response_model=DeepDiveVersionOut)
def create_deep_dive_version_api(
    idea_id: str,
    fields: dict = Body(...),
    llm_raw_response: str = Body(""),
    rerun_llm: bool = Body(False),
    db: Session = Depends(get_db)
):
    if rerun_llm:
        # Call LLM with edited fields as context
        try:
            deep_dive_result = generate_deep_dive(fields)  # Assume this is a sync call for now
            llm_raw = deep_dive_result.get('raw', '')
            parsed_fields = deep_dive_result.get('deep_dive', {})
            return create_deep_dive_version(db, idea_id, parsed_fields, llm_raw)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"LLM rerun failed: {str(e)}")
    else:
        return create_deep_dive_version(db, idea_id, fields, llm_raw_response)

@router.get("/{idea_id}/deepdive_versions/{version_number}", response_model=DeepDiveVersionOut)
def get_deep_dive_version_api(idea_id: str, version_number: int, db: Session = Depends(get_db)):
    version = get_deep_dive_version(db, idea_id, version_number)
    if not version:
        raise HTTPException(status_code=404, detail="Version not found")
    return version

@router.post("/{idea_id}/deepdive_versions/{version_number}/restore", response_model=IdeaOut)
def restore_deep_dive_version_api(idea_id: str, version_number: int, db: Session = Depends(get_db)):
    idea = restore_deep_dive_version(db, idea_id, version_number)
    if not idea:
        raise HTTPException(status_code=404, detail="Version or idea not found")
    return idea

@router.delete("/{idea_id}/deepdive_versions/{version_number}", response_model=dict)
def delete_deep_dive_version_api(idea_id: str, version_number: int, db: Session = Depends(get_db)):
    version = get_deep_dive_version(db, idea_id, version_number)
    if not version:
        raise HTTPException(status_code=404, detail="Version not found")
    db.delete(version)
    db.commit()
    return {"status": "deleted"}

@router.post("/{idea_id}/status", response_model=IdeaOut)
def update_status_api(idea_id: str, status: str = Body(...), db: Session = Depends(get_db)):
    try:
        updated_idea = update_idea_status(db, idea_id, status)
        return updated_idea
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/all", response_model=List[IdeaOut])
def get_all_ideas(db: Session = Depends(get_db)):
    """Get all ideas from all repos and manual generation"""
    try:
        ideas = db.query(Idea).order_by(Idea.created_at.desc()).all()
        return ideas
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch ideas: {str(e)}")

@router.post("/generate", response_model=dict)
async def generate_adhoc_ideas(
    industry: str = Body(...),
    business_model: str = Body(...),
    context: str = Body(""),
    db: Session = Depends(get_db)
):
    from app.services.pitch_generation import RANDY_RESUME
    
    # Build context similar to repo-based generation
    custom_context = f"Industry: {industry}\nBusiness Model: {business_model}\nContext: {context}\n"
    
    # Use the centralized idea generation service
    result = await generate_idea_pitches(custom_context)
    
    ideas = []
    for idea in result.get('ideas', []):
        # Skip error ideas
        if 'error' in idea:
            continue
            
        db_idea = Idea(
            repo_id=None,  # Manual ideas don't have a repo
            title=idea.get("title", ""),
            hook=idea.get("hook", ""),
            value=idea.get("value", ""),
            evidence=idea.get("evidence", ""),
            differentiator=idea.get("differentiator", ""),
            call_to_action=idea.get("call_to_action", ""),
            score=idea.get("score"),
            mvp_effort=idea.get("mvp_effort"),
            status="suggested",
            llm_raw_response=result.get('raw')
        )
        db.add(db_idea)
        db.commit()
        db.refresh(db_idea)
        ideas.append(db_idea)
    
    from app.schemas import IdeaOut
    return {"ideas": [IdeaOut.model_validate(i) for i in ideas]}

@router.get("/{idea_id}", response_model=IdeaOut)
def get_idea_by_id(idea_id: str, db: Session = Depends(get_db)):
    idea = db.query(Idea).filter(Idea.id == idea_id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")
    return idea

@router.post("/", response_model=IdeaOut)
def create_idea(
    title: str = Body(...),
    hook: Optional[str] = Body(None),
    value: Optional[str] = Body(None),
    evidence: Optional[str] = Body(None),
    differentiator: Optional[str] = Body(None),
    call_to_action: Optional[str] = Body(None),
    score: Optional[int] = Body(None),
    mvp_effort: Optional[int] = Body(None),
    status: str = Body("suggested"),
    repo_id: Optional[str] = Body(None),
    db: Session = Depends(get_db)
):
    # Validate required fields
    if not title:
        raise HTTPException(status_code=400, detail="Title is required")
    idea = Idea(
        title=title,
        hook=hook,
        value=value,
        evidence=evidence,
        differentiator=differentiator,
        call_to_action=call_to_action,
        score=score,
        mvp_effort=mvp_effort,
        status=status,
        repo_id=repo_id
    )
    db.add(idea)
    db.commit()
    db.refresh(idea)
    return idea 