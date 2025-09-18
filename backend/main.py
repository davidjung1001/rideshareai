# main.py
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from agents.rider_agent import rider_agent, df, llm as rider_llm
from agents.company_agent import company_agent, llm as company_llm

load_dotenv()
os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY")

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://rideshareai.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Query(BaseModel):
    question: str

class CompanyQuery(BaseModel):
    question: str  # single string input

@app.get("/")
async def root():
    return {"message": "Backend is running."}

# Rider chat (POST)
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

    # Step 2: Compute answer using the agent
    try:
        response = rider_agent.invoke({"input": query_text})
        result = response.get("output") or response

    except Exception as e:
        print("Agent error:", e)
        result = "Sorry, I couldn't compute the answer."

    # Step 3: Generate explanation using the same llm
    try:
        explanation_prompt = f"""
You are a rideshare data analyst assistant.

User asked: {query.question}
The computed answer is: {result}

Instructions:
- Return a structured markdown report with:
  1. **Computed Data** → the raw result (number, list, or table)
  2. **Contextual Analysis** → explain demand patterns
  3. **Event or Gathering Signals** → 
     • If ride counts are unusually high for a specific day/time/location, suggest that there may have been a large gathering.
     • Mention normalized hotspots like "Moody Center", "Q2 Stadium", "6th Street" if relevant.
     • Highlight unusually high passenger counts (large groups).
  4. **Comparisons** → compare to other days/times
  5. **Implications for Drivers** → how this affects earning potential, wait times, or surge pricing
- If there is no strong evidence for a large gathering, say "No clear indication of a large event."
- Use markdown headings (##), not bullets, for sections.
"""

        llm_response = rider_llm.invoke(explanation_prompt).content
    except Exception as e:
        print("Explanation error:", e)
        llm_response = result

    # Step 4: Return both the computed result and explanation
    return {
        "reply": llm_response,
        "computed_result": result
    }


# ----------------------------
# Company predictive chat endpoint
# ----------------------------
@app.post("/company-chat")
async def company_chat(query: CompanyQuery):
    try:
        # Pass the whole string to the agent
        response = company_agent.invoke({"input": query.question})
        result = response.get("output") or response
    except Exception as e:
        print("Agent error:", e)
        result = "Sorry, couldn't compute prediction."

    return {"reply": result}

# Optional: trips endpoint
@app.get("/trips")
async def get_trips():
    return df.to_dict(orient="records")
