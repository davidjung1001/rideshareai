# backend/main.py

import os
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_community.chat_models import ChatOpenAI
from langchain_experimental.agents import create_pandas_dataframe_agent
from dotenv import load_dotenv

# ----------------------------
# Set OpenAI API key
# ----------------------------
load_dotenv()
os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000", "https://rideshareai.vercel.app/chat")

# ----------------------------
# Sample rideshare data
# ----------------------------
data = [
    {"group_id": 1, "name": "Group A", "destination": "Moody Center", "time": "2025-08-12 20:15:00", "size": 8, "age_range": "18-24"},
    {"group_id": 2, "name": "Group B", "destination": "Downtown Austin", "time": "2025-08-12 22:00:00", "size": 12, "age_range": "25-34"},
    {"group_id": 3, "name": "Group C", "destination": "Moody Center", "time": "2025-08-19 19:30:00", "size": 20, "age_range": "18-24"},
    {"group_id": 4, "name": "Group D", "destination": "6th Street", "time": "2025-08-19 23:00:00", "size": 15, "age_range": "21-29"},
    {"group_id": 5, "name": "Group E", "destination": "Moody Center", "time": "2025-08-25 18:45:00", "size": 30, "age_range": "18-24"},
    {"group_id": 6, "name": "Group F", "destination": "Domain", "time": "2025-08-26 21:00:00", "size": 6, "age_range": "25-34"},
]

df = pd.DataFrame(data)
df["time"] = pd.to_datetime(df["time"])
df["month"] = df["time"].dt.to_period("M")
df["large_group"] = df["size"] > 10

# ----------------------------
# Initialize LLM and agent
# ----------------------------
llm = ChatOpenAI(temperature=0, model_name="gpt-3.5-turbo")
agent = create_pandas_dataframe_agent(llm, df, verbose=False, allow_dangerous_code=True)

# ----------------------------
# FastAPI setup
# ----------------------------
app = FastAPI()

# ----------------------------
# Enable CORS for React frontend
# ----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],  # React app origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------------
# Request model
# ----------------------------
class Query(BaseModel):
    question: str

# ----------------------------
# Chat endpoint
# ----------------------------
@app.post("/chat")
async def chat(query: Query):
    response = agent.invoke({"input": query.question})
    # Make sure we return a string for JSON
    if hasattr(response, "get") and "output_text" in response.get("output_text", {}):
        answer = response["output_text"]
    else:
        answer = str(response)
    return {"reply": answer}
