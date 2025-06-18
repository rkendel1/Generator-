# backend/start.py
import uvicorn
import os
from init_db import init_database

if __name__ == "__main__":
    # Initialize database
    try:
        init_database()
    except Exception as e:
        print(f"Database initialization failed: {e}")
        print("Continuing anyway...")
    
    # Start the server
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    ) 