#!/usr/bin/env python3
"""
Seed data script for Generator- application
"""
import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db import SessionLocal
from models import Repo, Idea

def seed_data():
    """Seed the database with sample data"""
    session = SessionLocal()
    
    try:
        # Check if data already exists
        existing_repos = session.query(Repo).count()
        if existing_repos > 0:
            print("Database already has data, skipping seed...")
            return
        
        print("🌱 Seeding database with sample data...")
        
        # Create sample repository
        repo = Repo(
            name="Awesome React Boilerplate",
            url="https://github.com/example/react-boilerplate",
            summary="A production-ready React boilerplate with routing, state management, and comprehensive tooling for modern web development.",
            language="JavaScript",
            trending_period="daily"
        )
        
        session.add(repo)
        session.commit()
        
        print(f"✅ Created repository: {repo.name}")
        
        # No ideas are seeded
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        session.rollback()
        raise
    finally:
        session.close()

if __name__ == "__main__":
    seed_data()
