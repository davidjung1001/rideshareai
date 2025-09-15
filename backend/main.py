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
FRONTEND_URL = os.getenv("FRONTEND_URL")

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
# Load trip data safely
# ----------------------------
DATA_PATH = "data/rideshare_preprocessed.csv"
df = pd.read_csv(DATA_PATH)

# Standardize column names
df.columns = [col.strip().lower().replace(" ", "_") for col in df.columns]

# Convert datetime and add helper columns

df["trip_date_and_time"] = pd.to_datetime(df["trip_date_and_time"], errors="coerce")

df = df.dropna(subset=["trip_date_and_time"])  # drop rows with invalid dates
df["hour"] = df["trip_date_and_time"].dt.hour
df["day"] = df["trip_date_and_time"].dt.date
df["weekday"] = df["trip_date_and_time"].dt.day_name()   
df["large_group"] = df["total_passengers"] > 6

df.to_csv("data/rideshare_processed.csv", index=False)


# ----------------------------
# Initialize AI agent
# ----------------------------
llm = ChatOpenAI(temperature=0.7, model_name="gpt-3.5-turbo")
agent = create_pandas_dataframe_agent(
    llm,
    df,
    verbose=False,
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
    # Build a friendly, conversational prompt
    query_text = f"""
You are a friendly rideshare assistant.
The dataset columns are:

- trip_id (int)
- booking_user_id (int)
- pick_up_latitude (float)
- pick_up_longitude (float)
- drop_off_latitude (float)
- drop_off_longitude (float)
- pick_up_address (str)
- drop_off_address (str)
- trip_date_and_time (datetime)
- total_passengers (int)
- age (int or NaN)
- hour (int)
- day (date)
- weekday (str)
- large_group (bool)

Write Python code using pandas to answer the user's question dynamically.
Do not guess — compute using the data.

User question: {query.question}
"""
    try:
        response = agent.invoke({"input": query_text})
        # Safely convert to string
        if hasattr(response, "get") and "output_text" in response.get("output_text", {}):
            answer = response["output_text"]
        else:
            answer = response.get("output") or str(response)
    except Exception as e:
        print("Agent error:", e)
        answer = "Sorry, I couldn't generate an answer at this time."

    # ----------------------------
    # Compute top pickup/dropoff patterns
    # ----------------------------
    try:
        top_pick_ups = (
            df.groupby(["pick_up_latitude", "pick_up_longitude", "pick_up_address"])
            .size()
            .reset_index(name="count")
            .sort_values("count", ascending=False)
            .head(5)
            .to_dict(orient="records")
        )

        top_drop_offs = (
            df.groupby(["drop_off_latitude", "drop_off_longitude", "drop_off_address"])
            .size()
            .reset_index(name="count")
            .sort_values("count", ascending=False)
            .head(5)
            .to_dict(orient="records")
        )
    except Exception as e:
        print("Pattern error:", e)
        top_pickups = []
        top_dropoffs = []

    return {"reply": answer, "top_pick_ups": top_pick_ups, "top_drop_offs": top_drop_offs}

@app.get("/trips")
async def get_trips():
    return df.to_dict(orient="records")

