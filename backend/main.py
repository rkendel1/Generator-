# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import repos, ideas as app_ideas
from routers import admin, ideas as router_ideas
from logging_config import setup_logging
from error_handlers import setup_error_handlers

# Setup logging
setup_logging()

app = FastAPI(title="Generator- API", version="1.0.0")

# Setup error handlers
setup_error_handlers(app)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8081", "http://127.0.0.1:8081", "http://localhost:8082", "http://127.0.0.1:8082"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(repos.router)
app.include_router(app_ideas.router, prefix="/ideas", tags=["ideas"])
app.include_router(router_ideas.router, prefix="/ideas", tags=["ideas"])
app.include_router(admin.router, prefix="/admin", tags=["admin"])

@app.get("/")
async def root():
    return {"message": "Generator- API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "Generator- API"}
