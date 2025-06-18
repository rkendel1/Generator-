# Backend Index - Generator- Project

## Current State
- ✅ Backend is running successfully on port 8000
- ✅ Database is healthy and seeded with sample data
- ✅ All API endpoints are functional
- ✅ FastAPI application is fully operational

## API Endpoints

### Health Check
- `GET /health` - Returns backend health status

### Repositories
- `GET /repos` - Get all repositories
  - Query params: `language`, `search`, `period`
- `GET /repos/{repo_id}` - Get specific repository
- `POST /repos` - Create new repository

### Ideas
- `GET /ideas` - Get all ideas
- `GET /ideas/repo/{repo_id}` - Get ideas for specific repository
- `POST /ideas` - Create new idea
- `POST /ideas/{idea_id}/deepdive` - Generate deep dive for idea
- `GET /ideas/{idea_id}` - Get specific idea

### Admin
- `GET /admin/stats` - Get system statistics
- `POST /admin/seed` - Seed database with sample data

## Database Schema

### Repo Table
- `id` (String, Primary Key)
- `name` (String, indexed)
- `url` (String, unique)
- `summary` (Text)
- `language` (String, indexed)
- `created_at` (DateTime)
- `trending_period` (String, default: "daily")

### Idea Table
- `id` (String, Primary Key)
- `repo_id` (String, Foreign Key to repos.id)
- `title` (String)
- `hook` (Text)
- `value` (Text)
- `evidence` (Text)
- `differentiator` (Text)
- `call_to_action` (Text)
- `deep_dive` (JSONB)
- `score` (Integer)
- `mvp_effort` (Integer)
- `deep_dive_requested` (Boolean, default: false)
- `created_at` (DateTime)

## Services

### GitHub Service
- Fetches trending repositories from GitHub
- Supports language filtering and search
- Handles rate limiting and error recovery

### Pitch Generation Service
- Generates business ideas using Groq API
- Creates structured pitch content
- Handles idea scoring and effort estimation

### Deep Dive Service
- Generates investor deep dive analysis
- Uses Groq API for comprehensive analysis
- Includes multiple analysis sections

## Configuration
- Database: PostgreSQL on port 5432
- API: FastAPI on port 8000
- Environment Variables:
  - `DATABASE_URL`: PostgreSQL connection string
  - `GROQ_API_KEY`: Groq API key for AI services

## Cron Jobs
- Nightly runner for automated data fetching
- Repository trending updates
- Idea generation for new repositories

## Current Data
- Sample repositories loaded
- Sample ideas generated
- Database seeded and ready for new frontend

## Ready for New Frontend
The backend is fully operational and ready to serve a new frontend application. All endpoints are tested and working correctly. 