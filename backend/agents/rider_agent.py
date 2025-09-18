# agents/rider_agent.py
import pandas as pd
from langchain_community.chat_models import ChatOpenAI
from langchain_experimental.agents import create_pandas_dataframe_agent
from dotenv import load_dotenv
import os

load_dotenv()  # ensures OPENAI_API_KEY is loaded
llm = ChatOpenAI(
    temperature=0,
    model_name="gpt-4o-mini",
    openai_api_key=os.getenv("OPENAI_API_KEY")  # safe
)

# Load trip data
DATA_PATH = "data/rides_processed_new.csv"
df = pd.read_csv(DATA_PATH)

# --- Preprocessing (your existing cleaning code here) ---
df.columns = [col.strip().lower().replace(" ", "_") for col in df.columns]
df["trip_date_and_time"] = pd.to_datetime(df["trip_date_and_time"], errors="coerce")
df = df.dropna(subset=["trip_date_and_time"])
df["hour"] = df["trip_date_and_time"].dt.hour
df["date"] = df["trip_date_and_time"].dt.date
df["day"] = df["trip_date_and_time"].dt.day_name().str.lower()
df["large_group"] = df["total_passengers"] > 6

# Age bucket function
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

# Address normalization
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

# LLM + agent

rider_agent = create_pandas_dataframe_agent(
    llm,
    df,
    verbose=True,
    allow_dangerous_code=True,
    handle_parsing_errors=True,
)
