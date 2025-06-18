#!/usr/bin/env python3
"""
Script to wait for database to be ready before starting the application
"""
import os
import time
import psycopg2
from psycopg2 import OperationalError

def wait_for_db():
    """Wait for database to be ready"""
    database_url = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@db:5432/ideas")
    
    print("Waiting for database to be ready...")
    
    max_attempts = 30
    attempt = 0
    
    while attempt < max_attempts:
        try:
            conn = psycopg2.connect(database_url)
            conn.close()
            print("Database is ready!")
            return True
        except OperationalError as e:
            attempt += 1
            print(f"Database not ready yet (attempt {attempt}/{max_attempts}): {e}")
            time.sleep(2)
    
    print("Failed to connect to database after maximum attempts")
    return False

if __name__ == "__main__":
    if wait_for_db():
        exit(0)
    else:
        exit(1) 