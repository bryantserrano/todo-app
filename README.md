## Overview

This project is a full-stack Todo application with a **Backend** and **Frontend**. The backend uses **FastAPI** and connects to **MongoDB** for data storage, while the frontend is built with **React** and **Vite**.

## Backend

The backend is responsible for handling the API requests and interacting with the MongoDB database.

### Setup

1. Create a `.env` file in the root of the **backend** folder.
2. Add the following environment variables to your `.env` file:

   ```bash
   MONGO_URI=your_mongodb_connection_string
   ENVIRONMENT=development  # Options are: 'development', 'production' or 'testing' this affects logginglevel
   ```

For example:

```bash
MONGO_URI=mongodb://localhost:27017
ENVIRONMENT=development
```

### MongoDB Setup & Verification

Before running the backend, ensure MongoDB is running. Here are the recommended ways:

#### Option 1: Docker (Recommended)
```bash
# Start MongoDB container
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Verify it's running
docker ps | grep mongodb
```

#### Option 2: Homebrew (macOS)
```bash
# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Start the service
brew services start mongodb-community

# Verify it's running
brew services list | grep mongodb
```

#### Verify MongoDB Connection
```bash
# Check if port 27017 is listening
lsof -i :27017

# Or try to connect with mongosh (if installed)
mongosh mongodb://localhost:27017
```

#### Stop MongoDB
```bash
# If using Docker
docker stop mongodb

# If using Homebrew
brew services stop mongodb-community
```

### Running the Backend in Development

To start the **FastAPI** backend with auto-reload (recommended for development), run the following command from the backend directory:

```bash
uvicorn main:app --reload
```

Make sure your virtual environment is activated and that all dependencies are installed (see `requirements.txt`).
