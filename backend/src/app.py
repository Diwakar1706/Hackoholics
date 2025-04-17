from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from .modelTemp import get_travel_plan, initialization_error as model_init_error

# --- Pydantic Models - for request validation of chat in rct
class ChatRequest(BaseModel):
    start_location: str
    end_location: str
    preference: str = "greenest" # Default preference
    user_message: str # The actual user query or follow-up

app = FastAPI(
    title="TravelAPI",
    description="API for an AI assistant that plans eco-friendly travel.",
    version="1.0.1" 
)
origins = [
    "http://localhost:3000", 
    "http://localhost:5173", 
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    # when deploy put link here 
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # List of allowed origins
    allow_credentials=True, # Allow cookies to be included in requests
    allow_methods=["*"],    # Allow all methods (GET, POST, OPTIONS, etc.)
    allow_headers=["*"],    # Allow all headers
)

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    """
    Chat endpoint that receives travel details and returns an AI-generated plan
    by calling the model_logic module.
    """
    #  initialization error chk
    if model_init_error:
         raise HTTPException(status_code=503, detail=f"LLM Service Unavailable: {model_init_error}")

    print(f"Received request: {request.dict()}") # Log the request

    try:
        # Call the asynchronous function from model_logic to get the response
        ai_response_content = await get_travel_plan(
            start_location=request.start_location,
            end_location=request.end_location,
            preference=request.preference,
            user_message=request.user_message
        )

        response = {
            "start_location": request.start_location,
            "end_location": request.end_location,
            "preference": request.preference,
            "user_query": request.user_message,
            "ai_response": ai_response_content,
        }
        return JSONResponse(content=response, status_code=200)

    except Exception as e:
        print(f"Error processing chat request: {e}") # Loging the error
        raise HTTPException(status_code=500, detail=f"Internal server error: Failed to process travel plan request.")


@app.get("/")
def read_root():
    """
    Root endpoint providing basic info about the API.
    """
    # Also inform about potential model initialization issues at the root level
    status = "OK"
    details = "Welcome to the Sustainable Travel Planner API. Use the /chat endpoint to get travel plans."
    if model_init_error:
        status = "Error"
        details = f"Warning: The AI model backend encountered an issue during initialization: {model_init_error}. The /chat endpoint may not function."

    return {"status": status, "message": details}