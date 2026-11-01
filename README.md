## Overview

This project is a Todo application with a **FastAPI** backend, a **React + Vite** web frontend, and an **Expo / React Native** mobile app. The backend connects to **MongoDB** for data storage.

## Backend

The backend is responsible for handling the API requests and interacting with the MongoDB database.

### Setup

1. Create a `.env` file in the repository root (the same directory as this README).
2. Add the following environment variables to your `.env` file:

   ```bash
   MONGO_URI=your_mongodb_connection_string
   ENVIRONMENT=development  # Options: development, production, testing; controls log level
   ```

For example:

```bash
MONGO_URI=mongodb://localhost:27017
ENVIRONMENT=development
```

### MongoDB Setup & Verification

#### Run the full development stack with Docker Compose (Recommended)

Docker Compose starts MongoDB, the FastAPI backend, and the Vite frontend
together. Install Docker Desktop (or Docker Engine with the Compose plugin),
then run these commands from the repository root:

```bash
docker compose up --build
```

Open the frontend at `http://localhost:5173`, the backend health endpoint at
`http://localhost:8000/`, and the API docs at `http://localhost:8000/docs`.
The backend connects to MongoDB through the Compose network at
`mongodb://mongodb:27017`; from your host machine, MongoDB is available at
`mongodb://localhost:27017`.

The backend and frontend source directories are mounted into their containers,
so code changes reload during development. MongoDB data is kept in the named
`mongodb-data` volume across restarts. Stop the services with `Ctrl+C`, or run
`docker compose down`. To also delete the database volume and its data, run
`docker compose down --volumes`.

The web frontend currently stores todos in browser local storage and does not
call the FastAPI API. Compose runs the backend and database so they are ready
for API development, but existing web app tasks remain browser-local.

If you already started MongoDB with the standalone `docker run` command below,
stop that container before starting Compose because both use port `27017`:

```bash
docker stop mongodb
```

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

Install `uv` if needed:

```shell
curl -LsSf https://astral.sh/uv/install.sh | sh
```

From the repository root, create a virtual environment and install the backend dependencies:

```bash
cd todo-backend
uv venv
uv pip install --python .venv/bin/python -r requirements.txt
```

To start the **FastAPI** backend with auto-reload (recommended for development), run the following command from the backend directory:

```bash
.venv/bin/python -m uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`. Visit `http://localhost:8000/` for the health check.

### Running the Frontend in Development

Use a supported Node.js LTS release. From the repository root, install the web frontend dependencies:

```bash
cd todo-frontend
npm install
```

Then run the UI:

```bash
npm run dev
```

Open the URL printed by Vite, usually `http://localhost:5173/`.

### Hosting the standalone web app on GitHub Pages

**Live site:** [https://bryantserrano.github.io/todo-app/](https://bryantserrano.github.io/todo-app/)

The web frontend stores tasks and the selected theme in the browser's local
storage, so the static site does not need the FastAPI backend or MongoDB. Data
is local to each browser and device; it does not sync between them.

The `Deploy static site to GitHub Pages` workflow builds the frontend and
deploys it whenever changes are pushed to `main`. To enable it:

1. Push the repository to GitHub and open **Settings → Pages**.
2. Under **Build and deployment**, set the source to **GitHub Actions**.
3. Push to `main` (or run the workflow manually from the **Actions** tab).

After the workflow succeeds, GitHub shows the published site URL in the Pages
settings and in the workflow deployment environment.

### Running the Mobile App in Development

Install dependencies from the repository root:

```bash
cd todo-mobile
npm install
```

Start Expo:

```bash
npm run start
```

Use the Expo CLI prompts to open the app in an available simulator or on a device with Expo Go. You can also run `npm run ios`, `npm run android`, or `npm run web` when the corresponding platform is available.
