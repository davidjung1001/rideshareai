# main.py
import os
from fastapi import FastAPI
from fastapi import Query as FQuery
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
# ----------------------------
# Rider chat (POST) - improved
# ----------------------------
@app.post("/chat")
async def chat(query: Query):
    # Step 1: Build a dataset summary for context
    top_pickups = df['pick_up_normalized'].value_counts().head(5).to_dict()
    top_dropoffs = df['drop_off_normalized'].value_counts().head(5).to_dict()
    total_trips = len(df)
    date_range = f"{df['trip_date_and_time'].min()} to {df['trip_date_and_time'].max()}"
    missing_ages = df['age'].isna().sum()

    summary = f"""
Dataset Summary:
- Total trips: {total_trips}
- Date range: {date_range}
- Missing age values: {missing_ages}
- Top 5 pickup locations: {top_pickups}
- Top 5 dropoff locations: {top_dropoffs}
"""

    # Step 2: Build enhanced agent prompt
    query_text = f"""
You are a rideshare data analyst.
Use only the python_repl_ast tool to execute pandas commands on the dataframe df.
Do NOT output raw Python code or extra words.
If you cannot answer from the dataset, respond: "I don't know from this data.".
Do NOT use extra backticks.

Dataset columns: trip_id, booking_user_id, pick_up_latitude, pick_up_longitude,
drop_off_latitude, drop_off_longitude, pick_up_address, drop_off_address,
drop_off_normalized, pick_up_normalized, trip_date_and_time, total_passengers,
age, age_group, hour, date, day, large_group, destination.

- If age or other fields are missing, compute using available data and note the limitation.
- Do NOT make up data.
- When asked about top destinations, return only the top 3.
- When asked about weekdays, include top destinations and peak times.
Present results in a clean markdown table without using extra backticks. 

Dataset summary:
{summary}

User question: {query.question}
"""

    # Step 3: Invoke the rider agent
    try:
        response = rider_agent.invoke({"input": query_text})
        result = response.get("output") or response
    except Exception as e:
        print("Agent error:", e)
        result = "Sorry, I couldn't compute the answer. Please try rephrasing the question the prompt to be more specific."

    # Step 4: Generate contextual explanation using LLM
    if result != "Sorry, I couldn't compute the answer." and "I don't know from this data." not in str(result):
        try:
            explanation_prompt = f"""
You are a rideshare data analyst assistant.
User asked: {query.question}
Computed result: {result}

Do NOT use outside information.
Instructions:
- Only use information from the dataframe.
- Present a structured markdown report with sections:
  1. ### Computed Data → show the table, number, or list
  2. ### Contextual Analysis → explain what this means in rideshare trends
  3. ### Comparisons → compare with other days, times, or groups if possible
  4. ### Implications for Riders/Drivers → explain practical meaning
- Use AM/PM for times.
- Keep explanations concise but insightful.
"""
            llm_response = rider_llm.invoke(explanation_prompt).content
        except Exception as e:
            print("Explanation error:", e)
            llm_response = result
    else:
        llm_response = result

    # Step 5: Return structured reply
    return {
        "reply": llm_response,
        "computed_result": result,
        "dataset_summary": summary
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

@app.get("/hotzones")
async def get_hotzones(day: str = None, hour: str = None):
    df_filtered = df.copy()

    if day:
        df_filtered = df_filtered[df_filtered['day'].str.lower() == day.lower()]

    if hour is not None:
        try:
            hour_int = int(hour)
            df_filtered = df_filtered[df_filtered['hour'] == hour_int]
        except ValueError:
            pass

    top_zones = (
        df_filtered.groupby(['drop_off_latitude', 'drop_off_longitude', 'drop_off_normalized'])
        .size().reset_index(name='count')
        .sort_values('count', ascending=False)
        .head(10)
    )

    return [
        {
            "lat": row['drop_off_latitude'],
            "lng": row['drop_off_longitude'],
            "count": int(row['count']),
            "name": row['drop_off_normalized']
        }
        for _, row in top_zones.iterrows()
    ]
