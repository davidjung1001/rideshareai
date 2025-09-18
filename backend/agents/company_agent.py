import pandas as pd
from langchain_community.chat_models import ChatOpenAI
from langchain.agents import initialize_agent, Tool
from dotenv import load_dotenv
import os

# ----------------------------
# Load environment variables
# ----------------------------
load_dotenv()  # ensures OPENAI_API_KEY is loaded

# ----------------------------
# Initialize LLM
# ----------------------------
llm = ChatOpenAI(
    temperature=0,
    model_name="gpt-4o-mini",
    openai_api_key=os.getenv("OPENAI_API_KEY")
)

# ----------------------------
# Load preprocessed dataset
# ----------------------------
DATA_PATH = "data/rideshare_day_hour.csv"  # use the new preprocessed file
df = pd.read_csv(DATA_PATH)

# Get valid categories
day_categories = df["day"].astype("category").cat.categories

# ----------------------------
# Prediction function
# ----------------------------
def predict_demand(day: str, hour: int):
    day = day.lower()
    if day not in day_categories:
        return f"No data for {day}."
    
    row = df[(df["day"] == day) & (df["hour"] == hour)]
    if row.empty:
        return f"No data for {day} at hour {hour}."
    
    return int(row["trip_count"].values[0])

# ----------------------------
# Parse input like "Friday 12 PM"
# ----------------------------
def parse_day_hour(text: str):
    # Normalize input
    text = text.lower().replace("pm", "").replace("am", "")
    parts = text.split()
    
    if len(parts) >= 2:
        day = parts[0]
        try:
            hour = int(parts[1])
            # Convert 12-hour input like "6" into 24-hour if user forgot am/pm
            if "pm" in text and hour < 12:
                hour += 12
            return day, hour
        except ValueError:
            return day, 12  # fallback default hour
    return "friday", 12  # fallback default

# ----------------------------
# Tools
# ----------------------------
tools = [
    Tool(
        name="PredictDemand",
        func=lambda text: predict_demand(*parse_day_hour(text)),
        description="Predict trip demand for a given day and hour. Input can be natural text like 'Friday 12 PM'."
    )
]

# ----------------------------
# Initialize agent
# ----------------------------
company_agent = initialize_agent(
    tools,
    llm,
    agent="zero-shot-react-description",
    verbose=True,
    handle_parsing_errors=True,
)
