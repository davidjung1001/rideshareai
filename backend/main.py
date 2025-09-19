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
age, age_group, hour, date, day, large_group, destination.

Also include other relevant data from the dataframe.
When asked about top destinations, always only include the top 3.
When asked about how many trips to a certain place, look for the key words in the destination column.
If someone asks about a weekday (e.g. like friday), include top destinations and peak times.
Present the result in a markdown table with markdown headings.

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
    if result != "Sorry, I couldn't compute the answer." and "I don't know from this data." not in str(result):    
        try:
            explanation_prompt = f"""
You are a rideshare data analyst assistant.

User asked: {query.question}
The computed answer is: {result}

Instructions:
Do NOT write explantation outside of the information from the dataframe.
Always return time as AM and PM.
- Always generate a structured markdown report with the following sections:
  1. **Computed Data** → present the raw number, list, or table result
  2. **Contextual Analysis** → explain what this means in terms of rideshare trends
  3. **Comparisons** → compare with other days, times, or groups if possible
  4. **Implications for Riders/Drivers** → explain the practical meaning
- Use headings (##) instead of bullets for section titles.
- Use bullet points (•) only inside sections, not for every line.
- Present the data in a markdown format.
- Keep explanations concise but insightful.
"""
            llm_response = rider_llm.invoke(explanation_prompt).content
        except Exception as e:
            print("Explanation error:", e)
            llm_response = result
    else:
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
