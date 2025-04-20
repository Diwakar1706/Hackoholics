# from fastapi import FastAPI, HTTPException, Body
# from fastapi.responses import JSONResponse
# from pydantic import BaseModel, Field
# from typing import List, Optional
# from fastapi.middleware.cors import CORSMiddleware

# # Import model logic and database functions
# from .modelTemp import get_travel_comparison, initialization_error as model_init_error
# from .database import connect_to_mongo, close_mongo_connection, save_travel_choice

# # --- Pydantic Models ---
# class ComparisonRequest(BaseModel):
#     start_location: str
#     end_location: str
#     preference: str = "greenest"
#     user_message: str # Keep for potential context, can be simple like "Compare options"

# class TravelOption(BaseModel):
#     # Define structure expected from LLM/model_logic
#     mode: str
#     distance_km: Optional[float] = None
#     time_minutes: Optional[int] = None
#     co2_emission_g: Optional[int] = None
#     estimated_cost: Optional[str] = None
#     co2_saved_g: Optional[int] = None
#     booking_link: Optional[str] = None
#     is_recommended: Optional[bool] = False

# class TravelChoice(BaseModel):
#     # Model for data sent when user chooses an option
#     start_location: str
#     end_location: str
#     preference: str
#     chosen_mode: str = Field(..., alias="mode") # Alias to match TravelOption field
#     distance_km: Optional[float] = None
#     time_minutes: Optional[int] = None
#     co2_emission_g: Optional[int] = None
#     estimated_cost: Optional[str] = None
#     co2_saved_g: Optional[int] = None
#     booking_link: Optional[str] = None
#     # No need for is_recommended here

# # --- FastAPI App Initialization ---
# app = FastAPI(
#     title="Sustainable Travel Planner API",
#     description="API for comparing eco-friendly travel options and saving choices.",
#     version="2.0.0",
#     on_startup=[connect_to_mongo],  # Connect to DB on startup
#     on_shutdown=[close_mongo_connection], # Disconnect on shutdown
# )

# # --- CORS Middleware Configuration (Keep as before) ---
# origins = [
#     "http://localhost:3000", # Common React dev port
#     "http://localhost:5173", # Common Vite dev port
#     "http://127.0.0.1:3000",
#     "http://127.0.0.1:5173",
# ]
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=origins,
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # --- API Endpoints ---

# @app.post("/compare", response_model=List[TravelOption]) # Define response model
# async def compare_endpoint(request: ComparisonRequest):
#     """
#     Receives travel details and returns a list of comparable travel options.
#     """
#     if model_init_error:
#          raise HTTPException(status_code=503, detail=f"LLM Service Unavailable: {model_init_error}")

#     print(f"Received comparison request: {request.dict()}")

#     try:
#         # Get the structured comparison list from the model logic
#         comparison_list = await get_travel_comparison(
#             start_location=request.start_location,
#             end_location=request.end_location,
#             preference=request.preference,
#             user_message=request.user_message # Pass user message along
#         )
#         # FastAPI will automatically validate the output against List[TravelOption]
#         return comparison_list

#     except Exception as e:
#         print(f"Error processing comparison request: {e}")
#         # Provide more specific error if possible (e.g., LLM format error)
#         detail_msg = f"Internal server error: {e}"
#         if "JSON" in str(e):
#              detail_msg = "Error processing response from AI model. Invalid format received."
#              # Maybe return empty list instead of 500? Depends on desired frontend behavior.
#              # return []
#         raise HTTPException(status_code=500, detail=detail_msg)

# @app.post("/save_choice")
# async def save_choice_endpoint(choice: TravelChoice = Body(...)):
#     """
#     Receives the user's chosen travel option and saves it to the database.
#     """
#     print(f"Received choice to save: {choice.dict()}")

#     try:
#         # Convert Pydantic model to dict for saving
#         choice_dict = choice.dict(by_alias=True) # Use alias 'mode' for chosen_mode

#         inserted_id = await save_travel_choice(choice_dict)

#         if inserted_id:
#             return JSONResponse(
#                 content={"message": "Travel choice saved successfully.", "id": inserted_id},
#                 status_code=201 # Created
#             )
#         else:
#             # Error logged in database.py, return server error
#             raise HTTPException(status_code=500, detail="Failed to save travel choice to database.")

#     except Exception as e:
#         print(f"Error saving choice: {e}")
#         raise HTTPException(status_code=500, detail=f"Internal server error: {e}")


# @app.get("/")
# def read_root():
#     """ Root endpoint providing basic info about the API. """
#     status = "OK"
#     db_status = "Connected (assumed)" # Basic status, connect_to_mongo logs details
#     details = "Welcome to the Sustainable Travel Planner API. Use /compare and /save_choice endpoints."
#     if model_init_error:
#         status = "Error"
#         details = f"Warning: AI model backend issue: {model_init_error}."

   

#     return {"status": status, "db_status": db_status, "message": details}







from fastapi import FastAPI, HTTPException, Body
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, ValidationError
from typing import List, Optional, Dict, Any
from fastapi.middleware.cors import CORSMiddleware
import logging
import json # Import json for potential parsing if needed

# Import model logic and database functions
try:
    # Adjust relative paths if your structure differs
    from .modelTemp import (
        get_travel_comparison,
        get_chatbot_response, # Import NEW function
        initialization_error as model_init_error
    )
    from .database import connect_to_mongo, close_mongo_connection, save_travel_choice
except ImportError as e:
    print(f"ImportError: {e}. Attempting direct import...")
    try:
        from modelTemp import (
            get_travel_comparison,
            get_chatbot_response, # Import NEW function
            initialization_error as model_init_error
        )
        from database import connect_to_mongo, close_mongo_connection, save_travel_choice
    except ImportError:
        print("CRITICAL: Failed to import model or database modules.")
        # Define dummy functions/values
        async def get_travel_comparison(*args, **kwargs): raise HTTPException(503, "Model logic not loaded")
        async def get_chatbot_response(*args, **kwargs): return "Sorry, the chatbot AI module is not loaded."
        model_init_error = "Model module import failed"
        async def connect_to_mongo(): print("Warning: DB connect bypassed")
        async def close_mongo_connection(): print("Warning: DB close bypassed")
        async def save_travel_choice(*args, **kwargs): raise HTTPException(503, "Database logic not loaded")


# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Pydantic Models ---

# Model for comparison results (used in request and response)
class TravelOption(BaseModel):
    mode: str
    distance_km: Optional[float] = None
    time_minutes: Optional[int] = None
    co2_emission_g: Optional[int] = None
    estimated_cost: Optional[str] = None
    co2_saved_g: Optional[int] = None
    booking_link: Optional[str] = None
    is_recommended: Optional[bool] = False

class ComparisonRequest(BaseModel):
    start_location: str
    end_location: str
    preference: str = "greenest"
    user_message: str

class TravelChoice(BaseModel):
    start_location: str
    end_location: str
    preference: str
    chosen_mode: str = Field(..., alias="mode")
    distance_km: Optional[float] = None
    time_minutes: Optional[int] = None
    co2_emission_g: Optional[int] = None
    estimated_cost: Optional[str] = None
    co2_saved_g: Optional[int] = None
    booking_link: Optional[str] = None

# --- UPDATED Pydantic Models for Chatbot ---
class ChatbotRequest(BaseModel):
    user_message: str # User's feedback or question (no longer optional)
    start_location: str
    end_location: str
    preference: str
    # Receive the comparison results from the frontend
    comparison_results: List[TravelOption] = Field(default_factory=list) # Expect a list of TravelOption objects

class ChatbotResponse(BaseModel):
    message: str # The conversational response from the bot (removed type/recommendations)

# --- FastAPI App Initialization ---
app = FastAPI(
    title="Sustainable Travel Planner API",
    description="API for comparing travel options, saving choices, and providing contextual chat assistance.",
    version="2.2.0", # Incremented version
    on_startup=[connect_to_mongo],
    on_shutdown=[close_mongo_connection],
)

# --- CORS Middleware Configuration (Keep as before) ---
origins = [
    "http://localhost:3000", "http://localhost:5173",
    "http://127.0.0.1:3000", "http://127.0.0.1:5173",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"],
)

# --- API Endpoints ---

# /compare endpoint (Keep as in v2)
@app.post("/compare", response_model=List[TravelOption])
async def compare_endpoint(request: ComparisonRequest):
    """ Receives travel details, returns list of comparable travel options. """
    if model_init_error:
         logger.error(f"LLM Service Unavailable: {model_init_error}")
         raise HTTPException(status_code=503, detail=f"AI Service Unavailable: {model_init_error}")
    logger.info(f"Received comparison request: {request.dict(exclude={'user_message'})}") # Exclude long message from brief log
    try:
        comparison_list = await get_travel_comparison(
            start_location=request.start_location, end_location=request.end_location,
            preference=request.preference, user_message=request.user_message
        )
        return comparison_list
    except HTTPException as http_exc: raise http_exc
    except Exception as e:
        logger.exception(f"Error processing comparison request for {request.start_location} to {request.end_location}")
        detail_msg = "Internal server error during comparison."
        if "JSON" in str(e) or "format" in str(e).lower():
             detail_msg = "Error processing response from AI model. Invalid format received."
        raise HTTPException(status_code=500, detail=detail_msg)

# /save_choice endpoint (Keep as in v2)
@app.post("/save_choice", status_code=201)
async def save_choice_endpoint(choice: TravelChoice = Body(...)):
    """ Receives user's chosen travel option and saves it to DB. """
    logger.info(f"Received choice to save: {choice.dict()}")
    try:
        choice_dict = choice.dict(by_alias=True)
        inserted_id = await save_travel_choice(choice_dict)
        if inserted_id:
            return JSONResponse(content={"message": "Travel choice saved successfully.", "id": str(inserted_id)}, status_code=201)
        else:
            logger.error("save_travel_choice returned None/False, indicating DB save failure.")
            raise HTTPException(status_code=500, detail="Failed to save travel choice to database.")
    except HTTPException as http_exc: raise http_exc
    except Exception as e:
        logger.exception(f"Error saving choice: {choice.dict()}")
        raise HTTPException(status_code=500, detail="Internal server error while saving choice.")


# --- REWRITTEN Chatbot Endpoint ---
@app.post("/chatbot", response_model=ChatbotResponse)
async def chatbot_endpoint(request: ChatbotRequest):
    """
    Handles contextual chatbot interactions based on user feedback
    about the provided travel comparison results.
    """
    logger.info(f"Received chatbot request for '{request.start_location}' to '{request.end_location}'. Feedback: '{request.user_message}'")
    # Log comparison results count for debugging
    logger.debug(f"Chatbot received {len(request.comparison_results)} comparison results.")

    # Validate inputs
    if not request.user_message:
        logger.warning("Chatbot request received with empty user_message.")
        # Return error via the response model
        return ChatbotResponse(message="Please provide some feedback or ask a question.")

    if not request.comparison_results:
        logger.warning("Chatbot request received with empty comparison_results.")
        return ChatbotResponse(message="I need the travel options to discuss them. Please generate the comparison first.")

    # Check if AI model is available
    if model_init_error:
         logger.error(f"Chatbot cannot function, LLM Service Unavailable: {model_init_error}")
         # Don't raise HTTPException here, return error message via response model
         return ChatbotResponse(message=f"Sorry, the AI assistant is currently unavailable ({model_init_error}).")

    try:
        # Call the new model logic function
        response_message = await get_chatbot_response(
            start_location=request.start_location,
            end_location=request.end_location,
            preference=request.preference,
            comparison_results=request.comparison_results, # Pass the list of dicts directly
            user_feedback=request.user_message
        )

        # Return the conversational response from the LLM
        return ChatbotResponse(message=response_message)

    except ValidationError as ve:
        # Handle potential validation errors if comparison_results have wrong format
        logger.error(f"Pydantic validation error in chatbot request: {ve}")
        return ChatbotResponse(message="There seems to be an issue with the format of the travel options provided.")
    except HTTPException as http_exc:
        # Handle errors specifically raised from model logic (e.g., LLM unavailable)
        logger.error(f"HTTPException during chatbot processing: {http_exc.detail}")
        return ChatbotResponse(message=f"Sorry, an error occurred: {http_exc.detail}")
    except Exception as e:
        logger.exception(f"Unexpected error processing chatbot request: Feedback='{request.user_message}'")
        # Return a generic error response
        return ChatbotResponse(message="Sorry, something went wrong while processing your request.")


# / root endpoint (Keep as in v2)
@app.get("/")
def read_root():
    """ Root endpoint providing basic info about the API status. """
    status = "OK"
    db_status = "Connected (assumed, check logs)"
    details = "Welcome to the Sustainable Travel Planner API. Use /compare, /save_choice, and /chatbot endpoints."
    ai_status = "OK"
    if model_init_error:
        status = "Error"
        ai_status = f"Error ({model_init_error})"
        details = f"Warning: AI model backend issue: {model_init_error}. Comparison/Chatbot endpoints may fail."
        db_status = "N/A (due to model init error)"

    return {"status": status, "ai_model_status": ai_status, "db_status": db_status, "message": details}

