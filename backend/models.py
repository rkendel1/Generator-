from sqlalchemy import Column, String, Text, Integer, Boolean, DateTime, ForeignKey, func, Enum
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
import uuid
from database import Base

def gen_uuid(): return str(uuid.uuid4())

class Repo(Base):
    __tablename__ = "repos"
    id = Column(String, primary_key=True, default=gen_uuid)
    name = Column(String, index=True, nullable=False)
    url = Column(String, unique=True, nullable=False)
    summary = Column(Text)
    language = Column(String, index=True)
    created_at = Column(DateTime, server_default=func.now())
    ideas = relationship("Idea", back_populates="repo")
    trending_period = Column(String, default="daily")  # 'daily', 'weekly', 'monthly'

class Idea(Base):
    __tablename__ = "ideas"
    id = Column(String, primary_key=True, default=gen_uuid)
    repo_id = Column(String, ForeignKey("repos.id"), nullable=True)  # Allow NULL for manual ideas
    title = Column(String, nullable=False)
    hook = Column(Text)
    value = Column(Text)
    evidence = Column(Text)
    differentiator = Column(Text)
    call_to_action = Column(Text)
    deep_dive = Column(JSONB, default={})
    score = Column(Integer)
    mvp_effort = Column(Integer)
    deep_dive_requested = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
    repo = relationship("Repo", back_populates="ideas")
    llm_raw_response = Column(Text)  # Raw LLM response for idea generation
    deep_dive_raw_response = Column(Text)  # Raw LLM response for deep dive
    status = Column(Enum('suggested', 'deep_dive', 'iterating', 'considering', 'closed', name='idea_status'), default='suggested', nullable=False)

class Shortlist(Base):
    __tablename__ = "shortlists"
    id = Column(String, primary_key=True, default=gen_uuid)
    idea_id = Column(String, ForeignKey("ideas.id"), nullable=False, unique=True)
    created_at = Column(DateTime, server_default=func.now())

class DeepDiveVersion(Base):
    __tablename__ = "deep_dive_versions"
    id = Column(String, primary_key=True, default=gen_uuid)
    idea_id = Column(String, ForeignKey("ideas.id"), nullable=False)
    version_number = Column(Integer, nullable=False)
    fields = Column(JSONB, default={})
    llm_raw_response = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
