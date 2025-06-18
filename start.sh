#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Generator- Startup Script${NC}"
echo "================================"

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  No .env file found. Creating one...${NC}"
    cat > .env << EOF
# API Configuration
GROQ_API_KEY=your_groq_api_key_here

# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@db:5432/ideas
EOF
    echo -e "${YELLOW}📝 Please edit .env file and add your GROQ_API_KEY${NC}"
    echo -e "${YELLOW}   You can get one from: https://console.groq.com/keys${NC}"
    exit 1
fi

# Check if GROQ_API_KEY is set
if ! grep -q "GROQ_API_KEY=your_groq_api_key_here" .env && ! grep -q "GROQ_API_KEY=" .env; then
    echo -e "${RED}❌ GROQ_API_KEY not found in .env file${NC}"
    echo -e "${YELLOW}   Please add your GROQ_API_KEY to the .env file${NC}"
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running${NC}"
    echo -e "${YELLOW}   Please start Docker and try again${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Environment check passed${NC}"

# Ask user for mode
echo ""
echo -e "${BLUE}Choose startup mode:${NC}"
echo "1) Production (recommended)"
echo "2) Development (with hot reloading)"
read -p "Enter choice (1 or 2): " choice

case $choice in
    1)
        echo -e "${GREEN}🚀 Starting in PRODUCTION mode...${NC}"
        docker-compose up --build
        ;;
    2)
        echo -e "${GREEN}🚀 Starting in DEVELOPMENT mode...${NC}"
        docker-compose -f docker-compose.dev.yml up --build
        ;;
    *)
        echo -e "${RED}❌ Invalid choice${NC}"
        exit 1
        ;;
esac 