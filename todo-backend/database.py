import os
from pymongo import MongoClient, errors
from dotenv import load_dotenv
from logging_config import logger

# Load environment variables from a .env file
load_dotenv()

# Initialize MongoDB connection
try:
    client = MongoClient(os.getenv("MONGO_URI"), serverSelectionTimeoutMS=5000)
    db = client.todo_app
    tasks_collection = db.tasks
# Handle connection failure
except errors.ConnectionError as e:
    logger.error(f"Connection Error: {e}")
# Handle invalid configuration
except errors.ConfigurationError as e:
    logger.error(f"Configuration Error: {e}")
# Handle other errors
except Exception as e:
    logger.error(f"An unexpected error occurred: {e}")
    