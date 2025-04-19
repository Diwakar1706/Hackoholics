from fastapi import FastAPI, HTTPException, Body
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware

# Import model logic and database functions
from .modelTemp import get_travel_comparison, initialization_error as model_init_error
from .database import connect_to_mongo, close_mongo_connection, save_travel_choice

# --- Pydantic Models ---
class ComparisonRequest(BaseModel):
    start_location: str
    end_location: str
    preference: str = "greenest"
    user_message: str # Keep for potential context, can be simple like "Compare options"

class TravelOption(BaseModel):
    # Define structure expected from LLM/model_logic
    mode: str
    distance_km: Optional[float] = None
    time_minutes: Optional[int] = None
    co2_emission_g: Optional[int] = None
    estimated_cost: Optional[str] = None
    co2_saved_g: Optional[int] = None
    booking_link: Optional[str] = None
    is_recommended: Optional[bool] = False

class TravelChoice(BaseModel):
    # Model for data sent when user chooses an option
    start_location: str
    end_location: str
    preference: str
    chosen_mode: str = Field(..., alias="mode") # Alias to match TravelOption field
    distance_km: Optional[float] = None
    time_minutes: Optional[int] = None
    co2_emission_g: Optional[int] = None
    estimated_cost: Optional[str] = None
    co2_saved_g: Optional[int] = None
    booking_link: Optional[str] = None
    # No need for is_recommended here

# --- FastAPI App Initialization ---
app = FastAPI(
    title="Sustainable Travel Planner API",
    description="API for comparing eco-friendly travel options and saving choices.",
    version="2.0.0",
    on_startup=[connect_to_mongo],  # Connect to DB on startup
    on_shutdown=[close_mongo_connection], # Disconnect on shutdown
)

# --- CORS Middleware Configuration (Keep as before) ---
origins = [
    "http://localhost:3000", # Common React dev port
    "http://localhost:5173", # Common Vite dev port
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- API Endpoints ---

@app.post("/compare", response_model=List[TravelOption]) # Define response model
async def compare_endpoint(request: ComparisonRequest):
    """
    Receives travel details and returns a list of comparable travel options.
    """
    if model_init_error:
         raise HTTPException(status_code=503, detail=f"LLM Service Unavailable: {model_init_error}")

    print(f"Received comparison request: {request.dict()}")

    try:
        # Get the structured comparison list from the model logic
        comparison_list = await get_travel_comparison(
            start_location=request.start_location,
            end_location=request.end_location,
            preference=request.preference,
            user_message=request.user_message # Pass user message along
        )
        # FastAPI will automatically validate the output against List[TravelOption]
        return comparison_list

    except Exception as e:
        print(f"Error processing comparison request: {e}")
        # Provide more specific error if possible (e.g., LLM format error)
        detail_msg = f"Internal server error: {e}"
        if "JSON" in str(e):
             detail_msg = "Error processing response from AI model. Invalid format received."
             # Maybe return empty list instead of 500? Depends on desired frontend behavior.
             # return []
        raise HTTPException(status_code=500, detail=detail_msg)

@app.post("/save_choice")
async def save_choice_endpoint(choice: TravelChoice = Body(...)):
    """
    Receives the user's chosen travel option and saves it to the database.
    """
    print(f"Received choice to save: {choice.dict()}")

    try:
        # Convert Pydantic model to dict for saving
        choice_dict = choice.dict(by_alias=True) # Use alias 'mode' for chosen_mode

        inserted_id = await save_travel_choice(choice_dict)

        if inserted_id:
            return JSONResponse(
                content={"message": "Travel choice saved successfully.", "id": inserted_id},
                status_code=201 # Created
            )
        else:
            # Error logged in database.py, return server error
            raise HTTPException(status_code=500, detail="Failed to save travel choice to database.")

    except Exception as e:
        print(f"Error saving choice: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")


@app.get("/")
def read_root():
    """ Root endpoint providing basic info about the API. """
    status = "OK"
    db_status = "Connected (assumed)" # Basic status, connect_to_mongo logs details
    details = "Welcome to the Sustainable Travel Planner API. Use /compare and /save_choice endpoints."
    if model_init_error:
        status = "Error"
        details = f"Warning: AI model backend issue: {model_init_error}."

   

    return {"status": status, "db_status": db_status, "message": details}







