#!/usr/bin/env python3
"""
Clear deep dive from first idea for testing
"""
import os
import sys

from app.db import SessionLocal
from models import Idea

def clear_deep_dive():
    session = SessionLocal()
    try:
        idea = session.query(Idea).first()
        if idea:
            idea.deep_dive = None
            idea.deep_dive_requested = False
            session.commit()
            print(f'✅ Cleared deep dive for idea: {idea.title}')
        else:
            print('❌ No ideas found in database')
    except Exception as e:
        print(f'❌ Error: {e}')
        session.rollback()
    finally:
        session.close()

if __name__ == "__main__":
    clear_deep_dive() 