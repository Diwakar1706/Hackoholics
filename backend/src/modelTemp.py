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

    inputs = {
        "start_location": start_location,
        "end_location": end_location,
        "preference": preference,
        "user_message": user_message
    }

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
                    required_keys = {
                        "mode", "distance_km", "time_minutes", "co2_emission_g",
                        "estimated_cost", "co2_saved_g", "booking_link", "is_recommended"
                    }
                    recommendation_count = 0
                    for i, item in enumerate(parsed_data):
                        if isinstance(item, dict):
                            if required_keys.issubset(item.keys()):
                                # 🛠️ Fix: Cast CO2 fields to int to match response schema
                                try:
                                    item["co2_emission_g"] = int(round(item["co2_emission_g"]))
                                    item["co2_saved_g"] = int(round(item["co2_saved_g"]))
                                except (ValueError, TypeError) as cast_err:
                                    logger.warning(f"Skipping item #{i} due to CO2 cast error: {cast_err}")
                                    continue

                                validated_data.append(item)
                                if item.get('is_recommended') is True:
                                    recommendation_count += 1
                            else:
                                logger.warning(f"Skipping invalid item #{i} (missing keys: {required_keys - item.keys()}): {item}")
                        else:
                            logger.warning(f"Skipping non-dict item #{i}: {item}")
                    
                    if not validated_data:
                        raise Exception("LLM returned JSON list, but items were invalid.")
                    if recommendation_count != 1:
                        logger.warning(f"LLM response had {recommendation_count} recommended options. Expected 1.")

                    logger.info(f"Successfully parsed {len(validated_data)} travel options.")
                    return validated_data
                else:
                    raise Exception("LLM returned valid JSON, but it was not a list.")
            except json.JSONDecodeError as json_err:
                raise Exception(f"LLM returned invalid JSON format: {json_err}")
        else:
            raise Exception("Could not find JSON list structure in LLM response.")

    except Exception as e:
        logger.exception(f"Error in get_travel_comparison for {start_location} to {end_location}")
        raise

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
