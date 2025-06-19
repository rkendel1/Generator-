# backend/app/schemas.py

from pydantic import BaseModel
from typing import Optional, Dict, Any, Literal
from datetime import datetime

class RepoOut(BaseModel):
    id: str
    name: str
    url: str
    summary: Optional[str] = None
    language: Optional[str] = None
    created_at: Optional[datetime] = None
    trending_period: str = "daily"

    class Config:
        from_attributes = True

class IdeaOut(BaseModel):
    id: str
    repo_id: Optional[str] = None
    title: str
    hook: Optional[str] = None
    value: Optional[str] = None
    evidence: Optional[str] = None
    differentiator: Optional[str] = None
    call_to_action: Optional[str] = None
    deep_dive: Optional[Dict[str, Any]] = None
    score: Optional[int] = None
    mvp_effort: Optional[int] = None
    deep_dive_requested: bool = False
    created_at: Optional[datetime] = None
    llm_raw_response: Optional[str] = None
    deep_dive_raw_response: Optional[str] = None
    status: Literal['suggested', 'deep_dive', 'iterating', 'considering', 'closed']

    class Config:
        from_attributes = True

class ShortlistOut(BaseModel):
    id: str
    idea_id: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class DeepDiveVersionOut(BaseModel):
    id: str
    idea_id: str
    version_number: int
    fields: dict
    llm_raw_response: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
