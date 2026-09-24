# AI Agent Instructions for Todo App

This document provides guidance for AI agents working on the Todo App project.

## Project Structure

```
todo-app/
├── todo-backend/          # FastAPI backend
│   ├── main.py           # FastAPI app & routes
│   ├── models.py         # Pydantic data models
│   ├── crud.py           # Database operations
│   ├── database.py       # MongoDB connection
│   ├── logging_config.py # Logging setup
│   ├── requirements.txt  # Python dependencies
│   └── test_api.py       # API tests
├── todo-frontend/        # React + Vite frontend
│   ├── src/
│   │   ├── App.tsx       # Main app component
│   │   ├── components/   # React components
│   │   ├── services/     # API client
│   │   └── types/        # TypeScript types
│   ├── package.json      # Node dependencies
│   └── vite.config.ts    # Vite configuration
└── README.md             # Project documentation
```

## Tech Stack

- **Backend**: FastAPI (Python)
- **Frontend**: React 18 + TypeScript + Vite
- **Database**: MongoDB
- **Styling**: Tailwind CSS

## Common Tasks

### Starting the Development Environment

Three terminals needed:

**Terminal 1 - MongoDB**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**Terminal 2 - Backend**
```bash
cd todo-backend
pip install -r requirements.txt  # First time only
uvicorn main:app --reload
```

**Terminal 3 - Frontend**
```bash
cd todo-frontend
npm install  # First time only
npm run dev
```

### Backend Development

- **Add new endpoints**: Edit `main.py`
- **Add new database operations**: Update `crud.py`
- **Add new models**: Update `models.py`
- **Database connection**: See `database.py`
- **Run tests**: `pytest test_api.py`
- **Check logs**: `tail -f logs/backend.log`

### Frontend Development

- **Add new components**: Create in `src/components/`
- **Add new pages**: Update `src/App.tsx`
- **API integration**: Use `src/services/api.ts`
- **Type definitions**: Add types in `src/types/`
- **Styling**: Update CSS files or use Tailwind classes

## API Endpoints

- `GET /` - Health check
- `GET /tasks` - Get all tasks
- `POST /tasks` - Create a new task
- `GET /tasks/{task_id}` - Get a specific task
- `PUT /tasks/{task_id}` - Update a task
- `DELETE /tasks/{task_id}` - Delete a task

## Database Schema

### Tasks Collection
```json
{
  "_id": "ObjectId",
  "title": "string",
  "description": "string (optional)",
  "completed": "boolean"
}
```

## Known Issues & Solutions

### MongoDB Connection Failed
- Ensure MongoDB container is running: `docker ps | grep mongodb`
- Check MongoDB logs: `docker logs mongodb`
- Restart: `docker stop mongodb && docker start mongodb`

### Frontend can't connect to backend
- Verify backend is running on `http://localhost:8000`
- Check CORS settings in `main.py`
- Frontend origin should be `http://localhost:5173`

### Port conflicts
- Change backend port in startup command: `uvicorn main:app --port 8001 --reload`
- Change frontend port in `vite.config.ts`
- Update API URL in `src/services/api.ts`

## Environment Setup

### Backend `.env` File
```bash
MONGO_URI=mongodb://localhost:27017
ENVIRONMENT=development  # Options: development, production, testing
```

### Frontend Configuration
- API base URL: `src/services/api.ts` (currently `http://localhost:8000/tasks`)
- Development server: Vite (port 5173)

## Testing

### Backend
```bash
cd todo-backend
pytest test_api.py -v
```

### Verify API with curl
```bash
# Get all tasks
curl http://localhost:8000/tasks

# Create a task
curl -X POST http://localhost:8000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "New Task", "description": "description", "completed": false}'

# Delete a task
curl -X DELETE http://localhost:8000/tasks/{task_id}
```

## Performance Notes

- MongoDB data persists in Docker volumes between container restarts
- Frontend caches data in React state (refresh browser to reload from API)
- CORS is enabled only for `http://localhost:5173`

## Next Steps for Development

- Add task descriptions and detailed views
- Implement task categories/tags
- Add due dates and priorities
- User authentication
- Database persistence with backups
