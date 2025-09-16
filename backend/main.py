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
DATA_PATH = "data/rideshare_preprocessed.csv"
df = pd.read_csv(DATA_PATH)

# Clean column names
df.columns = [col.strip().lower().replace(" ", "_") for col in df.columns]

# Convert datetime
df["trip_date_and_time"] = pd.to_datetime(df["trip_date_and_time"], errors="coerce")
df = df.dropna(subset=["trip_date_and_time"])

# Helper columns
df["hour"] = df["trip_date_and_time"].dt.hour
df["day"] = df["trip_date_and_time"].dt.date
df["weekday"] = df["trip_date_and_time"].dt.day_name().str.lower()
df["large_group"] = df["total_passengers"] > 6

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
    # Step 1: Ask the agent to produce the pandas result
    query_text = f"""
You are a rideshare data analyst.
Always produce valid Python/pandas code to compute the answer.
Dataset columns: trip_id, booking_user_id, pick_up_latitude, pick_up_longitude,
drop_off_latitude, drop_off_longitude, pick_up_address, drop_off_address,
drop_off_normalized, pick_up_normalized, trip_date_and_time, total_passengers,
age, age_group, hour, day, weekday, large_group.

Only compute using pandas. If uncertain, say "I don’t know from this data."

User question: {query.question}
"""
    try:
        response = agent.invoke({"input": query_text})
        # Extract raw result from agent execution
        result = response.get("output") or str(response)
    except Exception as e:
        print("Agent error:", e)
        result = "Sorry, I couldn't compute the answer."

    # Step 2: Generate explanation using another call
    try:
        explanation_prompt = f"""
    User asked: {query.question}
    The computed answer is: {result}
    Explain clearly what this means in context of rideshare trends.
    """
        llm_response = llm.invoke(explanation_prompt).content
    except Exception as e:
        print("Explanation error:", e)
        llm_response = result


    # Global patterns (optional)
    top_pick_ups = (
        df.groupby("pick_up_normalized")
        .size()
        .reset_index(name="count")
        .sort_values("count", ascending=False)
        .head(5)
        .to_dict(orient="records")
    )

    top_drop_offs = (
        df.groupby("drop_off_normalized")
        .size()
        .reset_index(name="count")
        .sort_values("count", ascending=False)
        .head(5)
        .to_dict(orient="records")
    )

    return {
        "reply": llm_response,
        "top_pick_ups": top_pick_ups,
        "top_drop_offs": top_drop_offs,
    }

@app.get("/trips")
async def get_trips():
    return df.to_dict(orient="records")
