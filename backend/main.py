import os
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_community.chat_models import ChatOpenAI
from langchain_experimental.agents import create_pandas_dataframe_agent
from dotenv import load_dotenv

# ----------------------------
# Load environment variables
# ----------------------------
load_dotenv()
os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY")

# ----------------------------
# FastAPI setup
# ----------------------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://rideshareai.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------------
# Load trip data
# ----------------------------
DATA_PATH = "data/rideshare_processed.csv"
df = pd.read_csv(DATA_PATH)

# Clean column names
df.columns = [col.strip().lower().replace(" ", "_") for col in df.columns]

# Convert datetime
df["trip_date_and_time"] = pd.to_datetime(df["trip_date_and_time"], errors="coerce")
df = df.dropna(subset=["trip_date_and_time"])

# Helper columns
df["hour"] = df["trip_date_and_time"].dt.hour
df["date"] = df["trip_date_and_time"].dt.date
df["day"] = df["trip_date_and_time"].dt.day_name().str.lower()
df["large_group"] = df["total_passengers"] > 6
# Rename columns



# Age groups
def age_bucket(age):
    if pd.isna(age):
        return "unknown"
    age = int(age)
    if 18 <= age <= 24:
        return "18-24"
    elif 25 <= age <= 34:
        return "25-34"
    elif 35 <= age <= 44:
        return "35-44"
    else:
        return "45+"

df["age_group"] = df["age"].apply(age_bucket)

# Optional: normalize hotspots
hotspot_map = {
    "moody center": "Moody Center",
    "coconut club": "Coconut Club",
    "buford": "Buford's",
    "the aquarium": "The Aquarium on 6th",
}
def normalize_address(addr: str):
    if not isinstance(addr, str):
        return addr
    a = addr.lower()
    for k, v in hotspot_map.items():
        if k in a:
            return v
    return addr

df["drop_off_normalized"] = df["drop_off_address"].apply(normalize_address)
df["pick_up_normalized"] = df["pick_up_address"].apply(normalize_address)

# ----------------------------
# Initialize AI agent
# ----------------------------
llm = ChatOpenAI(temperature=0, model_name="gpt-4o-mini")

agent = create_pandas_dataframe_agent(
    llm,
    df,
    verbose=True,
    allow_dangerous_code=True,
    handle_parsing_errors=True,
)

# ----------------------------
# Request model
# ----------------------------
class Query(BaseModel):
    question: str

# ----------------------------
# Routes
# ----------------------------
@app.get("/")
async def root():
    return {"message": "Backend is running. Use /chat to send questions."}

@app.post("/chat")
async def chat(query: Query):
    # Step 1: Prepare prompt for agent
    query_text = f"""
You are a rideshare data analyst.
You must use only the python_repl_ast tool to execute pandas commands on the dataframe df.
Do not out put output extra words or sentences only the python command to execute.
Do NOT output raw Python.
Do not add extra backticks
If you cannot answer from the dataset, respond with: "I don't know from this data." and explain why you couldn't.

Dataset columns: trip_id, booking_user_id, pick_up_latitude, pick_up_longitude,
drop_off_latitude, drop_off_longitude, pick_up_address, drop_off_address,
drop_off_normalized, pick_up_normalized, trip_date_and_time, total_passengers,
age, age_group, hour, date, day, large_group. 


User question: {query.question}
"""

    try:
        # Step 2: Let agent compute actual answer
        response = agent.invoke({"input": query_text})
        result = response.get("output") or response
    except Exception as e:
        print("Agent error:", e)
        result = "Sorry, I couldn't compute the answer."

    # Step 3: Ask LLM to explain the result
    try:
        explanation_prompt = f"""
User asked: {query.question}
The computed answer is: {result}
Briefly summarize in broken down sections with headings and separators what this means in context of rideshare trends using the actual computed data.
If it is a list, generate a markdown table.
"""
        llm_response = llm.invoke(explanation_prompt).content
    except Exception as e:
        print("Explanation error:", e)
        llm_response = result

    return {
        "reply": llm_response,
        "computed_result": result
    }




@app.get("/trips")
async def get_trips():
    return df.to_dict(orient="records")
