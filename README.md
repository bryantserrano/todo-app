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

### Running the Backend in Development

To start the **FastAPI** backend with auto-reload (recommended for development), run the following command from the backend directory:

```bash
uvicorn main:app --reload
```

Make sure your virtual environment is activated and that all dependencies are installed (see `requirements.txt`).
