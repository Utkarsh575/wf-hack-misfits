from langgraph.prebuilt.chat_agent_executor import AgentState

class AmlState(AgentState):
    wallet_address: str
    max_hops: int
    risk_score: int