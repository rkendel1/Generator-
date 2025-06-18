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
        
        # Create sample ideas
        ideas = [
            Idea(
                repo_id=repo.id,
                title="Remote UI Design Validator",
                hook="Transform this boilerplate into a collaborative UI validation platform for distributed design teams.",
                value="Real-time UI feedback and validation system that helps remote teams maintain design consistency.",
                evidence="78% of remote teams struggle with design consistency (Remote Work Report 2024)",
                differentiator="AI-powered design pattern recognition with real-time collaboration features.",
                call_to_action="Launch MVP in 3 weeks to validate with 5 design agencies.",
                score=8 if isinstance(8, int) else None,
                mvp_effort=3 if isinstance(3, int) else None,
                deep_dive_requested=False
            ),
            Idea(
                repo_id=repo.id,
                title="Code Review Simulator",
                hook="Build an AI-powered training platform that helps junior developers learn through simulated code reviews.",
                value="Interactive learning environment where developers practice code review skills with realistic scenarios.",
                evidence="Junior developers take 40% longer to complete code reviews without proper training (DevOps Research 2023)",
                differentiator="Personalized learning paths based on individual skill gaps and real-world scenarios.",
                call_to_action="Partner with 3 coding bootcamps to pilot the training program.",
                score=9 if isinstance(9, int) else None,
                mvp_effort=5 if isinstance(5, int) else None,
                deep_dive_requested=False
            ),
            Idea(
                repo_id=repo.id,
                title="Micro-Frontend Orchestrator",
                hook="Use this boilerplate to create a micro-frontend management system for large-scale applications.",
                value="Centralized platform for managing, deploying, and monitoring micro-frontend architectures.",
                evidence="67% of enterprise applications are moving toward micro-frontend architectures (Frontend Trends 2024)",
                differentiator="Zero-downtime deployment with automatic dependency resolution and version management.",
                call_to_action="Target 10 enterprise clients with existing micro-frontend challenges.",
                score=7 if isinstance(7, int) else None,
                mvp_effort=6 if isinstance(6, int) else None,
                deep_dive_requested=False
            )
        ]
        
        session.add_all(ideas)
        session.commit()
        
        print(f"✅ Created {len(ideas)} sample ideas")
        print("🎉 Database seeded successfully!")
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        session.rollback()
        raise
    finally:
        session.close()

if __name__ == "__main__":
    seed_data()
