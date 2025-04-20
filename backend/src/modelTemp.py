
# import os
# from langchain.prompts import PromptTemplate
# from langchain_groq import ChatGroq
# from langchain.chains import LLMChain
# from langchain.memory import ConversationBufferMemory # Keep memory for potential follow-up context if needed
# from dotenv import load_dotenv
# import json
# import logging

# # Configure logging
# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

# # --- Configuration & Initialization (Keep as before) ---
# load_dotenv()
# import os
# from langchain.prompts import PromptTemplate
# from langchain_groq import ChatGroq
# from langchain.chains import LLMChain
# from langchain.memory import ConversationBufferMemory
# from dotenv import load_dotenv
# import json
# import logging
# import re # Import regex for better cleaning

# # Configure logging
# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

# # --- Configuration & Initialization (Keep as before) ---
# load_dotenv()
# groq_api_key = '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'#os.getenv("GROQ_API_KEY")
# llm = None
# initialization_error = None

# if not groq_api_key:
#     initialization_error = "Error: GROQ_API_KEY environment variable not set."
#     logger.error(initialization_error)
# else:
#     try:
#         llm = ChatGroq(
#             model="llama3-8b-8192", # Or your preferred model
#             groq_api_key=groq_api_key,
#             temperature=0.1 # Keep low for structured output
#         )
#         logger.info("LLM Initialized Successfully.")
#     except Exception as e:
#         initialization_error = f"Error initializing LLM: {e}"
#         logger.error(initialization_error)
#         llm = None

# # --- Heavily Revised Prompt for Better Logic ---
# prompt_template_text = """
# You are an Agentic AI assistant specializing in sustainable urban mobility planning.
# Your goal is to provide a realistic and logical comparison of travel options.

# **User Request:**
# Travel from: {start_location}
# To: {end_location}
# Preference: {preference} (e.g., 'greenest', 'fastest', 'cheapest', 'balanced')

# **Your Task:**
# Analyze the request and provide a list of *feasible and relevant* travel options with *realistic estimated data*.
# Return the output ONLY as a valid JSON list (array) of objects.

# **CRITICAL INSTRUCTIONS:**

# 1.  **Mode Relevance:**
#     * Estimate the approximate distance between start and end locations first.
#     * Include "Walking" and "Cycling" ONLY if the estimated distance is realistically walkable/cyclable (e.g., less than 15-20 km).
#     * Include "Bus", "Metro", "Train", "Taxi/Rideshare", "Private Car" for appropriate urban/regional distances.
#     * Include "Flight" ONLY if the distance is very large (e.g., over 400-500 km). But if needed fastest then include flight(make sure airots are present  in those ocations or nearby)), Taxi/Car=150-250g/km, Flight=100-200g/passenger-km). Calculate total based on distance.
#     * `estimated_cost`: Provide relative ($/$$/$$$) or approximate range (e.g., "₹100-₹150"). Ensure "Free" for walking/cycling. Costs should reflect the mode and distance.
#     * `co2_saved_g`: Calculate accurately compared to a baseline private car trip (assume car = 250g/km). Formula: `max(0, (distance_km * 250) - co2_emission_g)`.

# 3.  **Recommendation Logic (`is_recommended`):**
#     * Strictly follow the user's '{preference}'.
#     * If 'greenest': Recommend the single option with the *lowest* `co2_emission_g`. Break ties using lowest cost, then lowest time.
#     * If 'fastest': Recommend the single option with the *lowest* `time_minutes`. Break ties using lowest CO2, then lowest cost.
#     * If 'cheapest': Recommend the single option with the *lowest* estimated cost (interpret ranges/symbols appropriately). Break ties using lowest CO2, then lowest time.
#     * If 'balanced': Try to find a good compromise, often favoring public transport (Bus/Metro/Train) if available, otherwise weigh factors reasonably.
#     * Set `is_recommended: true` for ONLY ONE option. All others MUST be `false`.

# 4.  **JSON Output Format:**
#     * Output ONLY the JSON list, starting with `[` and ending with `]`.
#     * Ensure all keys are present in each object: "mode", "distance_km", "time_minutes", "co2_emission_g", "estimated_cost", "co2_saved_g", "booking_link", "is_recommended".
#     * Use correct data types (string, float/int, boolean).
#     * Provide placeholder/generic `booking_link`.

# **Example JSON Object Structure:**
# ```json
#   {{
#     "mode": "Bus",
#     "distance_km": 15.0,
#     "time_minutes": 45,
#     "co2_emission_g": 1050, // 15km * 70g/km
#     "estimated_cost": "₹50-₹80",
#     "co2_saved_g": 2700, // (15*250) - 1050
#     "booking_link": "Check local transit apps",
#     "is_recommended": false
#   }}
# ```

# **Self-Correction Check:** Before outputting, review the generated list. Are the modes relevant for the distance? Does the time realistically vary per mode? Is the recommendation strictly based on the preference? Is the JSON valid?

# **Conversation History (for context, if any):**
# {history}

# **User's Specific Query (if applicable, otherwise use main request):** {user_message}

# Provide ONLY the JSON list based on the request from {start_location} to {end_location} with preference '{preference}'.

# JSON List:
# """

# prompt = PromptTemplate(
#     input_variables=["start_location", "end_location", "preference", "history", "user_message"],
#     template=prompt_template_text
# )

# # --- Memory and Chain Initialization (Keep as before) ---
# memory = ConversationBufferMemory(memory_key="history", input_key="user_message")
# travel_chain = None
# if llm:
#     try:
#         travel_chain = LLMChain(llm=llm, prompt=prompt, memory=memory, verbose=True) # Set verbose=False in production
#         logger.info("LLM Chain Initialized Successfully.")
#     except Exception as e:
#         initialization_error = f"Error initializing LLM Chain: {e}"
#         logger.error(initialization_error)

# # --- Updated Core Logic Function ---
# async def get_travel_comparison(start_location: str, end_location: str, preference: str, user_message: str) -> list:
#     """ Gets a travel comparison list from the LLM, attempting to parse JSON. """
#     if not travel_chain:
#         error_msg = initialization_error or "LLM Chain is not available."
#         logger.error(error_msg)
#         raise Exception(error_msg)

#     inputs = {
#         "start_location": start_location,
#         "end_location": end_location,
#         "preference": preference,
#         "user_message": user_message,
#     }

#     try:
#         raw_response = await travel_chain.arun(inputs)
#         logger.debug(f"Raw LLM Response:\n{raw_response}") # Debug level for potentially large output

#         # --- Robust JSON Parsing ---
#         # Try to find JSON block, remove potential markdown fences and surrounding text
#         match = re.search(r'```json\s*(\[.*?\])\s*```|(\[.*?\])', raw_response, re.DOTALL | re.IGNORECASE)

#         if match:
#             # Prioritize fenced block (group 1), fallback to plain list (group 2)
#             json_string = match.group(1) if match.group(1) else match.group(2)
#             try:
#                 parsed_data = json.loads(json_string)
#                 if isinstance(parsed_data, list):
#                     # Basic validation of list items (optional but recommended)
#                     validated_data = []
#                     for item in parsed_data:
#                         if isinstance(item, dict) and 'mode' in item: # Check if it's a dict with at least 'mode'
#                              validated_data.append(item)
#                         else:
#                              logger.warning(f"Skipping invalid item in JSON list: {item}")

#                     if not validated_data:
#                          logger.error("Parsed JSON list contains no valid travel option objects.")
#                          raise Exception("LLM returned JSON list, but items were invalid.")

#                     logger.info(f"Successfully parsed and validated {len(validated_data)} travel options.")
#                     return validated_data
#                 else:
#                     logger.warning("LLM output parsed but is not a list.")
#                     raise Exception("LLM returned valid JSON, but it was not a list as expected.")
#             except json.JSONDecodeError as json_err:
#                 logger.error(f"Failed to decode LLM response as JSON: {json_err}")
#                 logger.error(f"Problematic JSON string segment: {json_string[:500]}...") # Log beginning of string
#                 raise Exception(f"LLM returned invalid JSON format: {json_err}")
#         else:
#             logger.error("Could not find JSON list structure in LLM response.")
#             logger.debug(f"LLM Response causing failure: {raw_response}")
#             raise Exception("LLM did not return the expected JSON list format.")

#     except Exception as e:
#         logger.error(f"Error during LLM chain execution or parsing: {e}")
#         # Re-raise exception to be handled by the API endpoint
#         raise


# llm = None
# initialization_error = None

# if not groq_api_key:
#     initialization_error = "Error: GROQ_API_KEY environment variable not set."
#     logger.error(initialization_error)
# else:
#     try:
#         llm = ChatGroq(
#             model="llama3-8b-8192",
#             groq_api_key=groq_api_key,
#             temperature=0.1 # Lower temperature for more predictable JSON
#         )
#         logger.info("LLM Initialized Successfully.")
#     except Exception as e:
#         initialization_error = f"Error initializing LLM: {e}"
#         logger.error(initialization_error)
#         llm = None

# # --- Updated Prompt for Structured Output ---
# # NOTE: Requesting JSON from LLMs can be fragile. Error handling/parsing is important.
# prompt_template_text = """
# You are an Agentic AI assistant specializing in sustainable urban mobility planning.
# Your goal is to provide a comparison of travel options between a start and end location.

# **User Request:**
# Travel from: {start_location}
# To: {end_location}
# Preference: {preference} (e.g., 'greenest', 'fastest', 'cheapest', 'balanced')

# **Your Task:**
# Analyze the request and provide a list of feasible travel options with estimated data.
# Return the output ONLY as a valid JSON list (array) of objects. Each object should represent one travel mode and have the following keys:
# - "mode": (string) The travel mode (e.g., "Walking", "Cycling", "Bus", "Metro", "Train", "Taxi/Rideshare", "Private Car", "Flight").
# - "distance_km": (float/int) Estimated distance in kilometers.
# - "time_minutes": (int) Estimated travel time in minutes.
# - "co2_emission_g": (int) Estimated CO2 emissions in grams (e.g., Walking/Cycling=0, Bus=70, Metro=30, Taxi=200, Car=250, Flight=calculate based on distance if possible, otherwise estimate high).
# - "estimated_cost": (string) Estimated cost range or value (e.g., "Free", "$", "$$", "$$$", "€5-€10", "Approx. ₹1500"). Use local currency if context allows, otherwise use generic symbols or USD/EUR.
# - "co2_saved_g": (int) Estimated CO2 saved compared to a standard private car trip over the same distance (assume car emits 250g/km). Calculate as (distance_km * 250) - co2_emission_g. Ensure non-negative.
# - "booking_link": (string) A placeholder or generic link (e.g., "N/A", "Check local transit apps", "https://www.uber.com", "https://www.skyscanner.com").
# - "is_recommended": (boolean) Set to true ONLY for the single best option matching the user's '{preference}', otherwise false. If multiple modes tie for the preference, you can mark one or provide a balanced recommendation.

# **Important:**
# - Provide data for *multiple relevant* modes (at least 3-5 if feasible for the distance). Include walking/cycling for short distances. Include flight only for very long distances.
# - Base estimations on general knowledge. State that values are estimates if unsure.
# - Ensure the output is ONLY the JSON list, starting with `[` and ending with `]`. Do not include any introductory text or explanations outside the JSON structure.

# **JSON Output:**
# ```json
# [
#   {{
#     "mode": "Example Mode 1",
#     "distance_km": 10.5,
#     "time_minutes": 30,
#     "co2_emission_g": 0,
#     "estimated_cost": "Free",
#     "co2_saved_g": 2625,
#     "booking_link": "N/A",
#     "is_recommended": false
#   }},
#   {{
#     "mode": "Example Mode 2",
#     "distance_km": 10.5,
#     "time_minutes": 60,
#     "co2_emission_g": 735,
#     "estimated_cost": "$",
#     "co2_saved_g": 1890,
#     "booking_link": "Check local transit apps",
#     "is_recommended": true
#   }}
#   // ... more modes
# ]
# ```

# **Conversation History (for context, if any):**
# {history}

# **User's Specific Query (if applicable, otherwise use main request):** {user_message}

# Provide ONLY the JSON list based on the request from {start_location} to {end_location} with preference '{preference}'.

# JSON List:
# """

# prompt = PromptTemplate(
#     input_variables=["start_location", "end_location", "preference", "history", "user_message"],
#     template=prompt_template_text
# )

# # --- Memory and Chain Initialization (Keep as before) ---
# # Memory might be less critical now but can provide context if needed.
# memory = ConversationBufferMemory(memory_key="history", input_key="user_message")
# travel_chain = None
# if llm:
#     try:
#         travel_chain = LLMChain(llm=llm, prompt=prompt, memory=memory, verbose=True)
#         logger.info("LLM Chain Initialized Successfully.")
#     except Exception as e:
#         initialization_error = f"Error initializing LLM Chain: {e}"
#         logger.error(initialization_error)

# # --- Updated Core Logic Function ---
# async def get_travel_comparison(start_location: str, end_location: str, preference: str, user_message: str) -> list:
#     """
#     Gets a travel comparison list from the LLM based on inputs.

#     Args:
#         start_location: The starting point.
#         end_location: The destination.
#         preference: User preference.
#         user_message: Specific query (can be same as main request info).

#     Returns:
#         A list of dictionaries representing travel options, parsed from LLM JSON output.
#         Returns an empty list or raises an exception on failure.
#     """
#     if not travel_chain:
#         error_msg = initialization_error or "LLM Chain is not available."
#         logger.error(error_msg)
#         raise Exception(error_msg)

#     inputs = {
#         "start_location": start_location,
#         "end_location": end_location,
#         "preference": preference,
#         "user_message": user_message, # Pass the user message for context
#     }

#     try:
#         raw_response = await travel_chain.arun(inputs)
#         logger.info(f"Raw LLM Response:\n{raw_response}")

#         # --- Attempt to parse the JSON response ---
#         # Clean potential markdown code fences or leading/trailing text
#         json_start_index = raw_response.find('[')
#         json_end_index = raw_response.rfind(']')

#         if json_start_index != -1 and json_end_index != -1:
#             json_string = raw_response[json_start_index : json_end_index + 1]
#             try:
#                 parsed_data = json.loads(json_string)
#                 if isinstance(parsed_data, list):
#                     logger.info("Successfully parsed LLM response as JSON list.")
#                     return parsed_data
#                 else:
#                     logger.warning("LLM output parsed but is not a list.")
#                     # Attempt to wrap if it's a single object? Or just fail.
#                     return [] # Return empty list if structure is wrong
#             except json.JSONDecodeError as json_err:
#                 logger.error(f"Failed to decode LLM response as JSON: {json_err}")
#                 logger.error(f"Problematic JSON string: {json_string}")
#                 # Optionally, try more robust cleaning/parsing here
#                 raise Exception(f"LLM returned invalid JSON format: {json_err}")
#         else:
#             logger.error("Could not find JSON list structure in LLM response.")
#             raise Exception("LLM did not return the expected JSON list format.")

#     except Exception as e:
#         logger.error(f"Error during LLM chain execution or parsing: {e}")
#         raise Exception(f"Error generating travel comparison: {e}")








import os
from langchain.prompts import PromptTemplate
from langchain_groq import ChatGroq
from langchain.chains import LLMChain
from langchain.memory import ConversationBufferMemory # Keep for comparison chain context
from dotenv import load_dotenv
import json
import logging
import re
from typing import List, Dict, Any

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Configuration & Initialization ---
load_dotenv()
# IMPORTANT: Using hardcoded key provided by user for demonstration. Use environment variables in production.
groq_api_key = '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'
llm = None
initialization_error = None
travel_chain = None # For comparison generation
chatbot_chain = None # NEW: For chatbot responses

if not groq_api_key:
    initialization_error = "Error: GROQ_API_KEY environment variable not set or key is missing."
    logger.error(initialization_error)
else:
    try:
        # Initialize the LLM (used by both chains)
        llm = ChatGroq(
            model="llama3-8b-8192",
            groq_api_key=groq_api_key,
            temperature=0.2 # Slightly higher temp for more conversational chatbot
        )
        logger.info(f"LLM Initialized Successfully with model llama3-8b-8192.")

        # --- Prompt and Chain for Travel Comparison (Keep as in v3) ---
        comparison_prompt_template_text = """
You are an Agentic AI assistant specializing in sustainable urban mobility planning.
Your goal is to provide a realistic and logical comparison of travel options based on user inputs.

**User Request:**
Travel from: {start_location}
To: {end_location}
Preference: {preference} (e.g., 'greenest', 'fastest', 'cheapest', 'balanced')

**Your Task:**
Analyze the request. Estimate the distance. Provide a list of *feasible and relevant* travel options with *realistic estimated data* for the specified journey.
Return the output ONLY as a valid JSON list (array) of objects. Each object MUST represent one travel mode.

**CRITICAL INSTRUCTIONS:**
1.  **Mode Relevance & Feasibility:** Estimate distance. Include Walking/Cycling ONLY if < 15-20 km. Include Flight ONLY if > 400-500 km AND airports likely exist. Exclude impractical modes.
2.  **Data Estimation:** `mode` (String), `distance_km` (Float/Int - consistent), `time_minutes` (Int - MUST vary per mode), `co2_emission_g` (Int - calculated), `estimated_cost` (String - relative/range), `co2_saved_g` (Int - calculated vs 250g/km car), `booking_link` (String - placeholder/generic), `is_recommended` (Boolean - exactly ONE true).
3.  **Recommendation Logic (`is_recommended: true`):** Strictly follow '{preference}'. 'greenest': lowest CO2. 'fastest': lowest time. 'cheapest': lowest cost. 'balanced': reasonable compromise (often public transport). Tie-breakers: CO2 -> cost -> time (adjust as needed). Set exactly ONE `is_recommended: true`.
4.  **JSON Output Format:** Output ONLY the JSON list `[...]`. Ensure ALL keys present in EVERY object. Use correct data types.

**Self-Correction Check:** Before outputting, review: Modes feasible? Estimates realistic? Time varies? Recommendation follows preference? Only ONE recommended? Output ONLY valid JSON list?

**Conversation History (for context, if any):** {history}
**User's Specific Query (if applicable, otherwise use main request):** {user_message}
Provide ONLY the JSON list based on the request from {start_location} to {end_location} with preference '{preference}'.
JSON List:
"""
        comparison_prompt = PromptTemplate(
            input_variables=["start_location", "end_location", "preference", "history", "user_message"],
            template=comparison_prompt_template_text
        )
        # Memory might be useful if comparison needs context, but not strictly necessary for one-shot comparison
        comparison_memory = ConversationBufferMemory(memory_key="history", input_key="user_message")
        travel_chain = LLMChain(llm=llm, prompt=comparison_prompt, memory=comparison_memory, verbose=False)
        logger.info("Travel Comparison LLM Chain Initialized Successfully.")

        # --- NEW: Prompt and Chain for Chatbot Assistance ---
        chatbot_prompt_template_text = """
You are a helpful travel planning assistant chatbot. You are discussing a list of travel options already generated for a user.
Your goal is to understand the user's feedback about the current recommendation and suggest a suitable alternative *from the provided list*.

**Context:**
User is planning travel From: {start_location} To: {end_location}
Original Preference: {preference}

**Generated Travel Options (JSON List):**
```json
{comparison_results_json}
```

**User's Feedback/Question:** {user_feedback}

**Your Task:**
1.  Identify the currently recommended option (`"is_recommended": true`) in the JSON list.
2.  Understand the user's feedback ({user_feedback}). What is their reason for dissatisfaction (e.g., cost, time, comfort, mode type)?
3.  Look through the *other* options in the provided JSON list.
4.  Find the *next best* option that addresses the user's feedback while still respecting the original '{preference}' as much as possible.
    * Example: If preference was 'greenest' and user dislikes the recommended Bus (e.g., "too slow"), suggest the *next lowest CO2* option (e.g., Train) if it's faster than the Bus, explaining the trade-off.
    * Example: If preference was 'fastest' and user dislikes the recommended Flight (e.g., "too expensive"), suggest the *next fastest* option (e.g., Train) if it's cheaper.
    * Example: If user says "I want something quieter" than the recommended Bus, suggest Train or Taxi/Car if available in the list.
5.  Respond conversationally. Acknowledge the user's feedback. Suggest the alternative mode from the list, briefly explaining why it might be a better fit based on their feedback and how it compares to their original preference (e.g., "Okay, if the bus is too slow, how about the Train option? It's still quite eco-friendly according to the list, though slightly higher emissions than the bus, but it should be faster.").
6.  If the user's feedback cannot be addressed by any other option in the list, explain that politely (e.g., "Based on the options generated, there isn't another mode that meets your request for [user's need] while staying close to your preference for [original preference].").
7.  If the user asks a general question about an option (e.g., "Tell me more about the train"), extract the relevant details for that mode from the JSON list and present them clearly.
8.  If the user's message is unrelated to the travel options provided, or anything unrelated or irrelevant, politely state that you can only help with the current trip comparison.
9. If the user asks for a new comparison, suggest they use the main panel to generate new options.
10. Provide only short, relevant and to the point conversational responses.

**Provide only concise to the point conversational response.** Do not output JSON.
Response:
"""
        chatbot_prompt = PromptTemplate(
            input_variables=["start_location", "end_location", "preference", "comparison_results_json", "user_feedback"],
            template=chatbot_prompt_template_text
        )
        # Chatbot doesn't need persistent memory between turns for this task
        chatbot_chain = LLMChain(llm=llm, prompt=chatbot_prompt, verbose=False)
        logger.info("Chatbot Assistance LLM Chain Initialized Successfully.")

    except Exception as e:
        initialization_error = f"Error initializing LLM or Chains: {e}"
        logger.exception("LLM/Chain Initialization failed.")
        llm = None
        travel_chain = None
        chatbot_chain = None


# --- Core Logic Function for Travel Comparison (Keep as in v3) ---
async def get_travel_comparison(start_location: str, end_location: str, preference: str, user_message: str) -> List[Dict[str, Any]]:
    """ Gets travel comparison JSON list from LLM, parses, validates. """
    if not travel_chain or not llm:
        error_msg = initialization_error or "Travel Comparison Chain/LLM is not available."
        logger.error(f"Cannot get travel comparison: {error_msg}")
        raise Exception(error_msg)
    # (Rest of the function remains the same as sustainable_travel_model_logic_v3)
    inputs = { "start_location": start_location, "end_location": end_location, "preference": preference, "user_message": user_message }
    try:
        logger.info(f"Invoking LLM chain for comparison: {inputs}")
        raw_response = await travel_chain.arun(inputs)
        logger.debug(f"Raw Comparison LLM Response:\n{raw_response}")
        match = re.search(r'```(?:json)?\s*(\[.*?\])\s*```|(\[.*?\])', raw_response, re.DOTALL | re.IGNORECASE)
        if match:
            json_string = match.group(1) if match.group(1) else match.group(2)
            logger.debug(f"Extracted Comparison JSON string: {json_string[:200]}...")
            try:
                parsed_data = json.loads(json_string)
                if isinstance(parsed_data, list):
                    validated_data = []
                    required_keys = {"mode", "distance_km", "time_minutes", "co2_emission_g", "estimated_cost", "co2_saved_g", "booking_link", "is_recommended"}
                    recommendation_count = 0
                    for i, item in enumerate(parsed_data):
                        if isinstance(item, dict):
                            if required_keys.issubset(item.keys()):
                                validated_data.append(item)
                                if item.get('is_recommended') is True: recommendation_count += 1
                            else: logger.warning(f"Skipping invalid item #{i} (missing keys: {required_keys - item.keys()}): {item}")
                        else: logger.warning(f"Skipping non-dict item #{i}: {item}")
                    if not validated_data: raise Exception("LLM returned JSON list, but items were invalid.")
                    if recommendation_count != 1: logger.warning(f"LLM response had {recommendation_count} recommended options. Expected 1.")
                    logger.info(f"Successfully parsed {len(validated_data)} travel options.")
                    return validated_data
                else: raise Exception("LLM returned valid JSON, but it was not a list.")
            except json.JSONDecodeError as json_err: raise Exception(f"LLM returned invalid JSON format: {json_err}")
        else: raise Exception("Could not find JSON list structure in LLM response.")
    except Exception as e: logger.exception(f"Error in get_travel_comparison for {start_location} to {end_location}"); raise

# --- NEW: Core Logic Function for Chatbot Assistance ---
async def get_chatbot_response(
    start_location: str,
    end_location: str,
    preference: str,
    comparison_results: List[Dict[str, Any]], # Pass the actual list of dicts
    user_feedback: str
) -> str:
    """
    Gets a conversational response from the LLM based on user feedback
    about the provided travel comparison results.
    """
    if not chatbot_chain or not llm:
        error_msg = initialization_error or "Chatbot Chain/LLM is not available."
        logger.error(f"Cannot get chatbot response: {error_msg}")
        # Return a generic error message instead of raising exception here,
        # as this is a chat interaction.
        return "Sorry, I'm having trouble accessing my analysis capabilities right now."

    if not comparison_results:
        logger.warning("get_chatbot_response called with empty comparison_results.")
        return "Please generate some travel options first using the main panel, then I can help you discuss them."

    try:
        # Convert Pydantic models to dictionaries before JSON serialization
        comparison_results_dicts = [result.dict() if hasattr(result, "dict") else result for result in comparison_results]
        comparison_results_json = json.dumps(comparison_results_dicts, indent=2)

        inputs = {
            "start_location": start_location,
            "end_location": end_location,
            "preference": preference,
            "comparison_results_json": comparison_results_json,
            "user_feedback": user_feedback,
        }

        logger.info(f"Invoking LLM chain for chatbot response. Feedback: '{user_feedback}'")
        # logger.debug(f"Chatbot LLM inputs: {inputs}") # Be careful logging potentially large JSON

        # Run the chatbot chain
        response_text = await chatbot_chain.arun(inputs)
        logger.info(f"Generated chatbot response: {response_text}")

        return response_text.strip()

    except Exception as e:
        logger.exception(f"Error during chatbot LLM chain execution for feedback: '{user_feedback}'")
        return "Sorry, I encountered an error trying to process your feedback. Please try rephrasing."


# --- Remove old recommendation functions ---
# def get_initial_recommendations(...): ...
# def get_alternative_recommendations(...): ...
