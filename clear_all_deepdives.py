#!/usr/bin/env python3
"""
Clear all deep dives from the database for testing
"""
import os
import sys

from app.db import SessionLocal
from models import Idea

def clear_all_deep_dives():
    session = SessionLocal()
    try:
        # Get all ideas with deep dives
        ideas_with_deep_dives = session.query(Idea).filter(Idea.deep_dive.isnot(None)).all()
        
        if not ideas_with_deep_dives:
            print("✅ No deep dives found in database")
            return
        
        print(f"🔍 Found {len(ideas_with_deep_dives)} ideas with deep dives:")
        
        for idea in ideas_with_deep_dives:
            print(f"  - {idea.title}")
            idea.deep_dive = None
            idea.deep_dive_requested = False
        
        session.commit()
        print(f"✅ Cleared deep dives from {len(ideas_with_deep_dives)} ideas")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        session.rollback()
    finally:
        session.close()

if __name__ == "__main__":
    clear_all_deep_dives() 