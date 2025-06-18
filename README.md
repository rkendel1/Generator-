# Generator-
# Tech Venture Harvester 🚀

Web app that fetches trending GitHub repos (React, Python, TS), generates creative ideas and investor deep dives via Groq API.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Groq API key (get one from [console.groq.com/keys](https://console.groq.com/keys))

### 1. Clone & Setup
```bash
git clone <your-repo-url>
cd Generator-
```

### 2. Configure Environment
```bash
# Run the startup script (it will create .env file)
./start.sh
```

Or manually create `.env` file:
```bash
# API Configuration
GROQ_API_KEY=your_groq_api_key_here

# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@db:5432/ideas
```

### 3. Start the Application

#### Option A: Using Startup Script (Recommended)
```bash
./start.sh
```

#### Option B: Manual Docker Commands
```bash
# Production mode
docker-compose up --build

# Development mode (with hot reloading)
docker-compose -f docker-compose.dev.yml up --build
```

### 4. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **Database**: localhost:5432

## 🏗️ Architecture

- **Frontend**: React + TypeScript + Vite (Port 5173)
- **Backend**: FastAPI + PostgreSQL + SQLAlchemy (Port 8000)
- **Database**: PostgreSQL 15 (Port 5432)
- **AI**: Groq API for idea generation and deep dives

## 🔧 Development

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

### Backend Development
```bash
cd backend
pip install -r requirements.txt
python start.py
```

### Database Management
```bash
# Initialize database
cd backend
python init_db.py

# Run migrations (if using Alembic)
alembic upgrade head
```

## 📊 Features

- **Real-time Trending Data**: Fetches current GitHub trending repositories
- **AI-Powered Ideation**: Generates creative, non-obvious business ideas
- **Investor-Grade Analysis**: Comprehensive deep dive evaluations
- **Multi-language Support**: Covers major programming languages
- **Automated Workflow**: Nightly processing pipeline
- **Interactive UI**: Browse, filter, and explore ideas

## 🐳 Docker Services

- **db**: PostgreSQL database
- **backend**: FastAPI application
- **frontend**: React development server
- **cronjob**: Automated data processing (runs once)

## 🔍 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Check what's using the ports
   lsof -i :5173
   lsof -i :8000
   lsof -i :5432
   ```

2. **Database connection issues**
   ```bash
   # Check database logs
   docker-compose logs db
   ```

3. **API key not working**
   - Verify your Groq API key is correct
   - Check the API key has sufficient credits

4. **Frontend not loading**
   ```bash
   # Check frontend logs
   docker-compose logs frontend
   ```

### Health Checks
- **Database**: `pg_isready -U postgres`
- **Backend**: `curl -f http://localhost:8000/health`
- **Frontend**: `wget --spider http://localhost:5173/`

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GROQ_API_KEY` | Groq API key for AI generation | Required |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@db:5432/ideas` |
| `VITE_API_URL` | Backend API URL for frontend | `http://localhost:8000` |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
