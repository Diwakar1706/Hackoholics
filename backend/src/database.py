import os
import motor.motor_asyncio # Async driver for MongoDB
from dotenv import load_dotenv
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()
MONGO_CONNECTION_STRING = 'mongodb://localhost:27017'#os.getenv("MONGO_CONNECTION_STRING")

# --- Database Connection ---
client = None
db = None
travel_choices_collection = None

async def connect_to_mongo():
    """Establishes connection to MongoDB."""
    global client, db, travel_choices_collection
    if not MONGO_CONNECTION_STRING:
        logger.error("MongoDB connection string not found in environment variables.")
        return False

    try:
        logger.info("Attempting to connect to MongoDB...")
        client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_CONNECTION_STRING)
        # Verify connection by listing databases (optional, but good practice)
        await client.admin.command('ping')
        db = client.get_database("sustainable_travel_db") # Or your preferred DB name
        travel_choices_collection = db.get_collection("travel_choices") # Collection name
        logger.info("Successfully connected to MongoDB.")
        return True
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        client = None
        db = None
        travel_choices_collection = None
        return False

async def close_mongo_connection():
    """Closes the MongoDB connection."""
    global client
    if client:
        client.close()
        logger.info("MongoDB connection closed.")

# --- Database Operations ---
async def save_travel_choice(choice_data: dict):
    """
    Saves the user's chosen travel option to the database.

    Args:
        choice_data: A dictionary containing details of the chosen travel option.
                     Expected keys: start_location, end_location, preference,
                     chosen_mode, distance_km, time_minutes, co2_emission_g,
                     estimated_cost, co2_saved_g (optional), booking_link (optional)

    Returns:
        The inserted document's ID as a string if successful, None otherwise.
    """
    # if not travel_choices_collection:
    if travel_choices_collection is None:

        logger.error("MongoDB collection is not available. Cannot save choice.")
        # Attempt to reconnect (optional, depends on strategy)
        # if not await connect_to_mongo():
        #     return None
        # else:
        #    logger.info("Reconnected to MongoDB.")
        return None # Fail if collection not ready

    try:
        # Add a timestamp
        choice_data["timestamp"] = datetime.utcnow()
        result = await travel_choices_collection.insert_one(choice_data)
        logger.info(f"Successfully saved travel choice with ID: {result.inserted_id}")
        return str(result.inserted_id) # Return ID as string
    except Exception as e:
        logger.error(f"Error saving travel choice to MongoDB: {e}")
        return None
