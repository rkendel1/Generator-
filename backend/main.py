# backend/main.py
from app.routers import repos

app = FastAPI()
app.include_router(repos.router)
