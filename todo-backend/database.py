import logging
from logging.handlers import RotatingFileHandler
from pymongo import MongoClient, errors
from dotenv import load_dotenv
import os

# Load environment variables from a .env file
load_dotenv()

# Ensure the "logs" directory exists
if not os.path.exists('logs'):
    os.makedirs('logs')

# Set up logging
logging.basicConfig(
    level=logging.ERROR,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("logs/backend-database.log"),
        logging.StreamHandler()
    ]
)

# Initialize MongoDB connection
try:
    client = MongoClient(os.getenv("MONGO_URI"), serverSelectionTimeoutMS=5000)
    db = client.todo_app
    tasks_collection = db.tasks
# Handle connection failure
except errors.ConnectionError as e:
    logging.error(f"Connection Error: {e}")
# Handle invalid configuration
except errors.ConfigurationError as e:
    logging.error(f"Configuration Error: {e}")
# Handle other errors
except Exception as e:
    logging.error(f"An unexpected error occurred: {e}")
    