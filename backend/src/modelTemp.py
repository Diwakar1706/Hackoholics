import os
from langchain.prompts import PromptTemplate
from langchain_groq import ChatGroq
from langchain.chains import LLMChain
from langchain.memory import ConversationBufferMemory
from dotenv import load_dotenv

load_dotenv()


groq_api_key = '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'#os.getenv("GROQ_API_KEY")
llm = None
initialization_error = None

if not groq_api_key:
    initialization_error = "Error: GROQ_API_KEY environment variable not set."
    print(initialization_error)
else:
    try:
        llm = ChatGroq(
            model="deepseek-r1-distill-llama-70b", 
            # model="deepseek-r1-distill-llama-70b", #trying others
            groq_api_key=groq_api_key
        )
        print("LLM Initialized Successfully.")
    except Exception as e:
        initialization_error = f"Error initializing LLM: {e}"
        print(initialization_error)
        llm = None # Ensure llm is None if initialization fails


prompt_template_text = """
You are an Agentic AI assistant specializing in sustainable urban mobility planning. Your goal is to help users find the most eco-friendly travel options between a start and end location, considering real-world factors where possible.

**Your Task:**
Based on the user's request and preferences, analyze the travel query from {start_location} to {end_location}.

1.  **Identify Potential Modes:** List feasible travel modes (e.g., walking, cycling, specific public transport like bus/metro if known for the area, ride-sharing, taxi, private vehicle).
2.  **Gather Data (Simulated/Estimated):** For each relevant mode, estimate:
    * Travel Time (approximate)
    * Estimated Cost (relative or approximate range)
    * Estimated CO2 Emissions (grams CO2e). Use typical values: Walking/Cycling (0), Bus (50-100 g/pkm), Metro/Train (20-50 g/pkm), Ride-share/Taxi (150-250 g/km), Private Car (150-300+ g/km). *State these are estimates.*
    * *Note: Access to real-time data (transit schedules, traffic, precise costs, dynamic emissions) is limited. Base your estimations on general knowledge.*
3.  **Analyze & Compare:** Evaluate the modes based on the user's preference: '{preference}'. Create a brief comparison highlighting pros and cons related to the preference.
4.  **Recommend:** Suggest the best option(s) according to the preference, clearly explaining why it's recommended and mentioning the environmental impact.
5.  **Constraint:** Strictly answer only travel planning questions related to the user's request. If the user asks something unrelated, politely state that you can only assist with sustainable travel planning for the given locations.

**Conversation History:**
{history}

**User's Current Request:** {user_message}

**Based on the above, provide a detailed travel plan comparison and recommendation:**
AI Assistant Response:
"""

prompt = PromptTemplate(
    input_variables=["start_location", "end_location", "preference", "history", "user_message"],
    template=prompt_template_text
)

# This is NOT suitable for production environments with concurrent users as conversations will get mixed.
#will replace with mongo in future if time is more.
memory = ConversationBufferMemory(memory_key="history", input_key="user_message")

travel_chain = None
if llm:
    try:
        travel_chain = LLMChain(llm=llm, prompt=prompt, memory=memory, verbose=True)
        print("LLM Chain Initialized Successfully.")
    except Exception as e:
        initialization_error = f"Error initializing LLM Chain: {e}"
        print(initialization_error)
else:
     pass


async def get_travel_plan(start_location: str, end_location: str, preference: str, user_message: str) -> str:
    """
    Gets a travel plan recommendation from the LLM based on inputs.

    Args:
        start_location: The starting point of the journey.
        end_location: The destination of the journey.
        preference: User preference (e.g., 'greenest', 'fastest').
        user_message: The specific query from the user.

    Returns:
        The AI-generated travel plan as a string.

    Raises:
        Exception: If the LLM chain is not available or if an error occurs during execution.
    """
    if not travel_chain:
        # Raise an exception if the chain wasn't initialized properly
        error_msg = initialization_error or "LLM Chain is not available."
        raise Exception(error_msg)

    inputs = {
        "start_location": start_location,
        "end_location": end_location,
        "preference": preference,
        "user_message": user_message,
    }

    try:
        # Run the LLM chain asynchronously
        response_content = await travel_chain.arun(inputs)
        return response_content
    except Exception as e:
        print(f"Error during LLM chain execution: {e}")
        # Re-raise the exception to be caught by the API endpoint
        raise Exception(f"Error generating travel plan: {e}")

