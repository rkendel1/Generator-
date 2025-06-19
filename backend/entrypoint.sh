#!/bin/bash
set -e

echo "🚀 Starting Generator- Backend..."

# Wait for database to be ready
echo "⏳ Waiting for database..."
python wait_for_db.py

if [ $? -ne 0 ]; then
    echo "❌ Failed to connect to database"
    exit 1
fi

# Initialize database
echo "🗄️ Initializing database..."
python init_db.py

if [ $? -ne 0 ]; then
    echo "❌ Failed to initialize database"
    exit 1
fi

# Seed database with sample data
# echo "🌱 Seeding database with sample data..."
# python scripts/seed_data.py

# if [ $? -ne 0 ]; then
#     echo "⚠️ Warning: Failed to seed database, continuing anyway..."
# fi

# Start the application
echo "🚀 Starting FastAPI application..."
python start.py 