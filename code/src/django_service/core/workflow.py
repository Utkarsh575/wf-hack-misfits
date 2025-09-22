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
    tools= [check_structuring, check_sanctions, compute_risk_score],
    checkpointer= checkpointer,
    prompt= "Analyze the wallet address for any money laundering behavior with the help of tools provided Do not call tools in parallel. You are getting the transaction details, mixers, sanctioned wallets. you have to perform layering analysis, behavior_check and sanction_check After all tool calls are done, call the risk_score tool to get the final risk score.",
    state_schema= AmlState
)

config = {"configurable": {"thread_id": "1"}}


def invoke_agent(wallet_address: str):
    response = agent.invoke(
        {"wallet_address": wallet_address, "max_hops": 1, "risk_score": 0.0},
        config=config
    )

    # Extract risk score
    raw_score = response.get('risk_score', 0)
    try:
        risk_score = int(float(raw_score))
    except Exception:
        risk_score = 0

    # Collect failed checks from tool messages
    failed_checks = []
    tool_messages = response.get('messages', [])
    for msg in tool_messages:
        if isinstance(msg, dict):
            content = msg.get('content', '')
        else:
            content = getattr(msg, 'content', '')
        if 'detected' in content or 'detected for address' in content or 'cycles detected' in content:
            failed_checks.append(content)

    return risk_score, failed_checks
 



