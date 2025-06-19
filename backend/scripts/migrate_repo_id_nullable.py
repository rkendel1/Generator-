#!/usr/bin/env python3
"""
Migration script to make repo_id nullable in the ideas table
"""
import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from database import DATABASE_URL

def migrate_repo_id_nullable():
    """Make repo_id nullable in the ideas table"""
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        # Check if the column is already nullable
        result = conn.execute(text("""
            SELECT is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'ideas' AND column_name = 'repo_id'
        """))
        row = result.fetchone()
        
        if row and row[0] == 'YES':
            print("✅ repo_id is already nullable")
            return
        
        # Make the column nullable
        print("🔄 Making repo_id nullable...")
        conn.execute(text("ALTER TABLE ideas ALTER COLUMN repo_id DROP NOT NULL"))
        conn.commit()
        print("✅ Successfully made repo_id nullable")

if __name__ == "__main__":
    migrate_repo_id_nullable() 