from crud import get_ideas_for_repo, request_deep_dive, save_deep_dive, add_to_shortlist, remove_from_shortlist, get_shortlist_ideas, create_deep_dive_version, get_deep_dive_versions, get_deep_dive_version, restore_deep_dive_version
from app.schemas import IdeaOut, ShortlistOut, DeepDiveVersionOut
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from llm import generate_deep_dive

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