import os
import logging

# Ensure the "logs" directory exists
if not os.path.exists('logs'):
    os.makedirs('logs')

ENV = os.getenv("ENVIRONMENT", "development")  # Default to development

LEVEL = {
    "development": logging.DEBUG,
    "production": logging.WARNING,
    "testing": logging.INFO,
}.get(ENV, logging.DEBUG)  # fallback to DEBUG

logging.basicConfig(
    level=LEVEL,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("logs/backend.log"),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)