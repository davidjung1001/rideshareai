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
# Load trip data
# ----------------------------
DATA_PATH = "data/trip_data.csv"
df = pd.read_csv(DATA_PATH)

# Standardize column names
df.columns = [col.strip().lower().replace(" ", "_") for col in df.columns]

# Convert datetime
df["trip_date_and_time"] = pd.to_datetime(df["trip_date_and_time"], format="%m/%d/%y %H:%M")
df["hour"] = df["trip_date_and_time"].dt.hour
df["day"] = df["trip_date_and_time"].dt.date
df["large_group"] = df["total_passengers"] > 4

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
@app.post("/chat/")
async def chat(query: Query):
    # Prompt for verbal, friendly responses
    query_text = f"""
You are a friendly rideshare assistant.
The dataset includes trip_id, booking_user_id, pickup/dropoff coordinates,
pickup/dropoff addresses, trip date and time, and total passengers.

- Suggest grouping options if trips are nearby in space/time.
- Explain dates/times naturally.
- Be conversational and helpful.

User question: {query.question}
"""

    # Run agent
    response = agent.invoke({"input": query_text})

    # Convert to string
    if hasattr(response, "get") and "output_text" in response.get("output_text", {}):
        answer = response["output_text"]
    else:
        answer = str(response)

    return {"reply": answer}
