from app.db import SessionLocal
from app.models import Repo, Idea

session = SessionLocal()

repo = Repo(
    name="Awesome React Boilerplate",
    url="https://github.com/example/react-boilerplate",
    description="A production-ready React boilerplate with routing, state, and linting.",
    language="JavaScript"
)

session.add(repo)
session.commit()

ideas = [
    Idea(
        repo_id=repo.id,
        title="Remote UI Design Validator",
        hook="Use this boilerplate to create a UI validator tool for remote teams.",
        score=8,
        mvp_effort=3,
        full_response={"title": "Remote UI Design Validator", "score": 8, "mvp_effort": 3}
    ),
    Idea(
        repo_id=repo.id,
        title="Code Review Simulator",
        hook="Build a tool that trains junior devs using simulated PRs from real projects.",
        score=9,
        mvp_effort=5,
        full_response={"title": "Code Review Simulator", "score": 9, "mvp_effort": 5}
    )
]

session.add_all(ideas)
session.commit()
