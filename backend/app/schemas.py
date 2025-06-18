# backend/app/schemas.py

from pydantic import BaseModel

class RepoOut(BaseModel):
    id: int
    name: str
    url: str
    description: str
    language: str
    trending_period: str

    class Config:
        orm_mode = True
