## Overview

This project is a full-stack Todo application with a **Backend** and **Frontend**. The backend uses **FastAPI** and connects to **MongoDB** for data storage, while the frontend is built with **React** and **Vite**.

## Backend

The backend is responsible for handling the API requests and interacting with the MongoDB database.

### Setup

1. Create a `.env` file in the root of the **backend** folder.
2. Add the following line to your `.env` file:

   ```bash
   MONGO_URI=your_mongodb_connection_string
   ```

For example:

```bash
MONGO_URI=mongodb://localhost:27017
```
