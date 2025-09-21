from langgraph.prebuilt import create_react_agent
from dotenv import load_dotenv
import os
from pydantic import SecretStr

from langchain_openai import ChatOpenAI
from langgraph.prebuilt import create_react_agent
from langgraph.checkpoint.memory import InMemorySaver
from core.agents.tools.behaviour_check import check_structuring
from core.agents.models.aml_state import AmlState
from core.agents.tools.sanction_check import check_sanctions
from core.agents.tools.risk_score_calculation import compute_risk_score
from core.agents.tools.layering_check import check_layering


load_dotenv()
model = ChatOpenAI(
    model="gpt-4o", 
    temperature=0, 
    api_key= SecretStr(os.getenv('OPENAI_API_KEY', ''))
)

checkpointer = InMemorySaver()

agent = create_react_agent(
    model= model,
    tools= [check_structuring, check_sanctions, compute_risk_score,check_layering],
    checkpointer= checkpointer,
    prompt= "Analyze the wallet address for any money laundering behaviour with the help of tools provided Do not call tools in parallel. After all tool calls are done, call the risk_score tool to get the final risk score.",
    state_schema= AmlState
)

config = {"configurable": {"thread_id": "1"}}

def invoke_agent(wallet_address: str):
    response = agent.invoke(
        {"wallet_address": wallet_address, "max_hops": 1, "risk_score": 0.0},
        config= config
    )

    # Agent may return numeric types as float/str; coerce to int defensively
    raw_score = response.get('risk_score', 0)
    try:
        risk_score = int(float(raw_score))
    except Exception:
        risk_score = 0

    return risk_score
 



