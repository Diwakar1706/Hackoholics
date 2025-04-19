
import os
from langchain.prompts import PromptTemplate
from langchain_groq import ChatGroq
from langchain.chains import LLMChain
from langchain.memory import ConversationBufferMemory # Keep memory for potential follow-up context if needed
from dotenv import load_dotenv
import json
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Configuration & Initialization (Keep as before) ---
load_dotenv()
import os
from langchain.prompts import PromptTemplate
from langchain_groq import ChatGroq
from langchain.chains import LLMChain
from langchain.memory import ConversationBufferMemory
from dotenv import load_dotenv
import json
import logging
import re # Import regex for better cleaning

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Configuration & Initialization (Keep as before) ---
load_dotenv()
groq_api_key = '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'#os.getenv("GROQ_API_KEY")
llm = None
initialization_error = None

if not groq_api_key:
    initialization_error = "Error: GROQ_API_KEY environment variable not set."
    logger.error(initialization_error)
else:
    try:
        llm = ChatGroq(
            model="llama3-8b-8192", # Or your preferred model
            groq_api_key=groq_api_key,
            temperature=0.1 # Keep low for structured output
        )
        logger.info("LLM Initialized Successfully.")
    except Exception as e:
        initialization_error = f"Error initializing LLM: {e}"
        logger.error(initialization_error)
        llm = None

# --- Heavily Revised Prompt for Better Logic ---
prompt_template_text = """
You are an Agentic AI assistant specializing in sustainable urban mobility planning.
Your goal is to provide a realistic and logical comparison of travel options.

**User Request:**
Travel from: {start_location}
To: {end_location}
Preference: {preference} (e.g., 'greenest', 'fastest', 'cheapest', 'balanced')

**Your Task:**
Analyze the request and provide a list of *feasible and relevant* travel options with *realistic estimated data*.
Return the output ONLY as a valid JSON list (array) of objects.

**CRITICAL INSTRUCTIONS:**

1.  **Mode Relevance:**
    * Estimate the approximate distance between start and end locations first.
    * Include "Walking" and "Cycling" ONLY if the estimated distance is realistically walkable/cyclable (e.g., less than 15-20 km).
    * Include "Bus", "Metro", "Train", "Taxi/Rideshare", "Private Car" for appropriate urban/regional distances.
    * Include "Flight" ONLY if the distance is very large (e.g., over 400-500 km). But if needed fastest then include flight(make sure airots are present  in those ocations or nearby)), Taxi/Car=150-250g/km, Flight=100-200g/passenger-km). Calculate total based on distance.
    * `estimated_cost`: Provide relative ($/$$/$$$) or approximate range (e.g., "₹100-₹150"). Ensure "Free" for walking/cycling. Costs should reflect the mode and distance.
    * `co2_saved_g`: Calculate accurately compared to a baseline private car trip (assume car = 250g/km). Formula: `max(0, (distance_km * 250) - co2_emission_g)`.

3.  **Recommendation Logic (`is_recommended`):**
    * Strictly follow the user's '{preference}'.
    * If 'greenest': Recommend the single option with the *lowest* `co2_emission_g`. Break ties using lowest cost, then lowest time.
    * If 'fastest': Recommend the single option with the *lowest* `time_minutes`. Break ties using lowest CO2, then lowest cost.
    * If 'cheapest': Recommend the single option with the *lowest* estimated cost (interpret ranges/symbols appropriately). Break ties using lowest CO2, then lowest time.
    * If 'balanced': Try to find a good compromise, often favoring public transport (Bus/Metro/Train) if available, otherwise weigh factors reasonably.
    * Set `is_recommended: true` for ONLY ONE option. All others MUST be `false`.

4.  **JSON Output Format:**
    * Output ONLY the JSON list, starting with `[` and ending with `]`.
    * Ensure all keys are present in each object: "mode", "distance_km", "time_minutes", "co2_emission_g", "estimated_cost", "co2_saved_g", "booking_link", "is_recommended".
    * Use correct data types (string, float/int, boolean).
    * Provide placeholder/generic `booking_link`.

**Example JSON Object Structure:**
```json
  {{
    "mode": "Bus",
    "distance_km": 15.0,
    "time_minutes": 45,
    "co2_emission_g": 1050, // 15km * 70g/km
    "estimated_cost": "₹50-₹80",
    "co2_saved_g": 2700, // (15*250) - 1050
    "booking_link": "Check local transit apps",
    "is_recommended": false
  }}
```

**Self-Correction Check:** Before outputting, review the generated list. Are the modes relevant for the distance? Does the time realistically vary per mode? Is the recommendation strictly based on the preference? Is the JSON valid?

**Conversation History (for context, if any):**
{history}

**User's Specific Query (if applicable, otherwise use main request):** {user_message}

Provide ONLY the JSON list based on the request from {start_location} to {end_location} with preference '{preference}'.

JSON List:
"""

prompt = PromptTemplate(
    input_variables=["start_location", "end_location", "preference", "history", "user_message"],
    template=prompt_template_text
)

# --- Memory and Chain Initialization (Keep as before) ---
memory = ConversationBufferMemory(memory_key="history", input_key="user_message")
travel_chain = None
if llm:
    try:
        travel_chain = LLMChain(llm=llm, prompt=prompt, memory=memory, verbose=True) # Set verbose=False in production
        logger.info("LLM Chain Initialized Successfully.")
    except Exception as e:
        initialization_error = f"Error initializing LLM Chain: {e}"
        logger.error(initialization_error)

# --- Updated Core Logic Function ---
async def get_travel_comparison(start_location: str, end_location: str, preference: str, user_message: str) -> list:
    """ Gets a travel comparison list from the LLM, attempting to parse JSON. """
    if not travel_chain:
        error_msg = initialization_error or "LLM Chain is not available."
        logger.error(error_msg)
        raise Exception(error_msg)

    inputs = {
        "start_location": start_location,
        "end_location": end_location,
        "preference": preference,
        "user_message": user_message,
    }

    try:
        raw_response = await travel_chain.arun(inputs)
        logger.debug(f"Raw LLM Response:\n{raw_response}") # Debug level for potentially large output

        # --- Robust JSON Parsing ---
        # Try to find JSON block, remove potential markdown fences and surrounding text
        match = re.search(r'```json\s*(\[.*?\])\s*```|(\[.*?\])', raw_response, re.DOTALL | re.IGNORECASE)

        if match:
            # Prioritize fenced block (group 1), fallback to plain list (group 2)
            json_string = match.group(1) if match.group(1) else match.group(2)
            try:
                parsed_data = json.loads(json_string)
                if isinstance(parsed_data, list):
                    # Basic validation of list items (optional but recommended)
                    validated_data = []
                    for item in parsed_data:
                        if isinstance(item, dict) and 'mode' in item: # Check if it's a dict with at least 'mode'
                             validated_data.append(item)
                        else:
                             logger.warning(f"Skipping invalid item in JSON list: {item}")

                    if not validated_data:
                         logger.error("Parsed JSON list contains no valid travel option objects.")
                         raise Exception("LLM returned JSON list, but items were invalid.")

                    logger.info(f"Successfully parsed and validated {len(validated_data)} travel options.")
                    return validated_data
                else:
                    logger.warning("LLM output parsed but is not a list.")
                    raise Exception("LLM returned valid JSON, but it was not a list as expected.")
            except json.JSONDecodeError as json_err:
                logger.error(f"Failed to decode LLM response as JSON: {json_err}")
                logger.error(f"Problematic JSON string segment: {json_string[:500]}...") # Log beginning of string
                raise Exception(f"LLM returned invalid JSON format: {json_err}")
        else:
            logger.error("Could not find JSON list structure in LLM response.")
            logger.debug(f"LLM Response causing failure: {raw_response}")
            raise Exception("LLM did not return the expected JSON list format.")

    except Exception as e:
        logger.error(f"Error during LLM chain execution or parsing: {e}")
        # Re-raise exception to be handled by the API endpoint
        raise


llm = None
initialization_error = None

if not groq_api_key:
    initialization_error = "Error: GROQ_API_KEY environment variable not set."
    logger.error(initialization_error)
else:
    try:
        llm = ChatGroq(
            model="llama3-8b-8192",
            groq_api_key=groq_api_key,
            temperature=0.1 # Lower temperature for more predictable JSON
        )
        logger.info("LLM Initialized Successfully.")
    except Exception as e:
        initialization_error = f"Error initializing LLM: {e}"
        logger.error(initialization_error)
        llm = None

# --- Updated Prompt for Structured Output ---
# NOTE: Requesting JSON from LLMs can be fragile. Error handling/parsing is important.
prompt_template_text = """
You are an Agentic AI assistant specializing in sustainable urban mobility planning.
Your goal is to provide a comparison of travel options between a start and end location.

**User Request:**
Travel from: {start_location}
To: {end_location}
Preference: {preference} (e.g., 'greenest', 'fastest', 'cheapest', 'balanced')

**Your Task:**
Analyze the request and provide a list of feasible travel options with estimated data.
Return the output ONLY as a valid JSON list (array) of objects. Each object should represent one travel mode and have the following keys:
- "mode": (string) The travel mode (e.g., "Walking", "Cycling", "Bus", "Metro", "Train", "Taxi/Rideshare", "Private Car", "Flight").
- "distance_km": (float/int) Estimated distance in kilometers.
- "time_minutes": (int) Estimated travel time in minutes.
- "co2_emission_g": (int) Estimated CO2 emissions in grams (e.g., Walking/Cycling=0, Bus=70, Metro=30, Taxi=200, Car=250, Flight=calculate based on distance if possible, otherwise estimate high).
- "estimated_cost": (string) Estimated cost range or value (e.g., "Free", "$", "$$", "$$$", "€5-€10", "Approx. ₹1500"). Use local currency if context allows, otherwise use generic symbols or USD/EUR.
- "co2_saved_g": (int) Estimated CO2 saved compared to a standard private car trip over the same distance (assume car emits 250g/km). Calculate as (distance_km * 250) - co2_emission_g. Ensure non-negative.
- "booking_link": (string) A placeholder or generic link (e.g., "N/A", "Check local transit apps", "https://www.uber.com", "https://www.skyscanner.com").
- "is_recommended": (boolean) Set to true ONLY for the single best option matching the user's '{preference}', otherwise false. If multiple modes tie for the preference, you can mark one or provide a balanced recommendation.

**Important:**
- Provide data for *multiple relevant* modes (at least 3-5 if feasible for the distance). Include walking/cycling for short distances. Include flight only for very long distances.
- Base estimations on general knowledge. State that values are estimates if unsure.
- Ensure the output is ONLY the JSON list, starting with `[` and ending with `]`. Do not include any introductory text or explanations outside the JSON structure.

**JSON Output:**
```json
[
  {{
    "mode": "Example Mode 1",
    "distance_km": 10.5,
    "time_minutes": 30,
    "co2_emission_g": 0,
    "estimated_cost": "Free",
    "co2_saved_g": 2625,
    "booking_link": "N/A",
    "is_recommended": false
  }},
  {{
    "mode": "Example Mode 2",
    "distance_km": 10.5,
    "time_minutes": 60,
    "co2_emission_g": 735,
    "estimated_cost": "$",
    "co2_saved_g": 1890,
    "booking_link": "Check local transit apps",
    "is_recommended": true
  }}
  // ... more modes
]
```

**Conversation History (for context, if any):**
{history}

**User's Specific Query (if applicable, otherwise use main request):** {user_message}

Provide ONLY the JSON list based on the request from {start_location} to {end_location} with preference '{preference}'.

JSON List:
"""

prompt = PromptTemplate(
    input_variables=["start_location", "end_location", "preference", "history", "user_message"],
    template=prompt_template_text
)

# --- Memory and Chain Initialization (Keep as before) ---
# Memory might be less critical now but can provide context if needed.
memory = ConversationBufferMemory(memory_key="history", input_key="user_message")
travel_chain = None
if llm:
    try:
        travel_chain = LLMChain(llm=llm, prompt=prompt, memory=memory, verbose=True)
        logger.info("LLM Chain Initialized Successfully.")
    except Exception as e:
        initialization_error = f"Error initializing LLM Chain: {e}"
        logger.error(initialization_error)

# --- Updated Core Logic Function ---
async def get_travel_comparison(start_location: str, end_location: str, preference: str, user_message: str) -> list:
    """
    Gets a travel comparison list from the LLM based on inputs.

    Args:
        start_location: The starting point.
        end_location: The destination.
        preference: User preference.
        user_message: Specific query (can be same as main request info).

    Returns:
        A list of dictionaries representing travel options, parsed from LLM JSON output.
        Returns an empty list or raises an exception on failure.
    """
    if not travel_chain:
        error_msg = initialization_error or "LLM Chain is not available."
        logger.error(error_msg)
        raise Exception(error_msg)

    inputs = {
        "start_location": start_location,
        "end_location": end_location,
        "preference": preference,
        "user_message": user_message, # Pass the user message for context
    }

    try:
        raw_response = await travel_chain.arun(inputs)
        logger.info(f"Raw LLM Response:\n{raw_response}")

        # --- Attempt to parse the JSON response ---
        # Clean potential markdown code fences or leading/trailing text
        json_start_index = raw_response.find('[')
        json_end_index = raw_response.rfind(']')

        if json_start_index != -1 and json_end_index != -1:
            json_string = raw_response[json_start_index : json_end_index + 1]
            try:
                parsed_data = json.loads(json_string)
                if isinstance(parsed_data, list):
                    logger.info("Successfully parsed LLM response as JSON list.")
                    return parsed_data
                else:
                    logger.warning("LLM output parsed but is not a list.")
                    # Attempt to wrap if it's a single object? Or just fail.
                    return [] # Return empty list if structure is wrong
            except json.JSONDecodeError as json_err:
                logger.error(f"Failed to decode LLM response as JSON: {json_err}")
                logger.error(f"Problematic JSON string: {json_string}")
                # Optionally, try more robust cleaning/parsing here
                raise Exception(f"LLM returned invalid JSON format: {json_err}")
        else:
            logger.error("Could not find JSON list structure in LLM response.")
            raise Exception("LLM did not return the expected JSON list format.")

    except Exception as e:
        logger.error(f"Error during LLM chain execution or parsing: {e}")
        raise Exception(f"Error generating travel comparison: {e}")








