#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Generator- Setup Script${NC}"
echo "=============================="

# Check if .env file exists
if [ -f .env ]; then
    echo -e "${GREEN}✅ .env file already exists${NC}"
else
    echo -e "${YELLOW}📝 Creating .env file...${NC}"
    cat > .env << 'EOF'
# API Configuration
GROQ_API_KEY=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

# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@db:5432/ideas
EOF
    echo -e "${GREEN}✅ .env file created${NC}"
fi

# Check if GROQ_API_KEY is set to default
if grep -q "GROQ_API_KEY=your_groq_api_key_here" .env; then
    echo -e "${YELLOW}⚠️  Please update your GROQ_API_KEY in the .env file${NC}"
    echo -e "${YELLOW}   You can get one from: https://console.groq.com/keys${NC}"
    echo ""
    echo -e "${BLUE}Current .env contents:${NC}"
    cat .env
    echo ""
    echo -e "${YELLOW}Edit the .env file and replace 'your_groq_api_key_here' with your actual Groq API key${NC}"
    echo -e "${YELLOW}Example: GROQ_API_KEY=gsk_abc123def456...${NC}"
else
    echo -e "${GREEN}✅ GROQ_API_KEY appears to be configured${NC}"
fi

echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Edit .env file with your Groq API key"
echo "2. Run: ./start.sh"
echo "3. Access the application at http://localhost:5173"
echo ""
echo -e "${GREEN}🎉 Setup complete!${NC}" 