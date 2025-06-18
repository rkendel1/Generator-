from sqlalchemy import Column, String, Text, Integer, Boolean, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
import uuid
from .database import Base

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

class Idea(Base):
    __tablename__ = "ideas"
    id = Column(String, primary_key=True, default=gen_uuid)
    repo_id = Column(String, ForeignKey("repos.id"), nullable=False)
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
