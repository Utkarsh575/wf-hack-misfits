# Analyzes the wallet's transactions to identify any money-laundering behaviour

import pandas as pd
from core.agents.models.aml_state import AmlState
from core.agents.tools.fetch_transactions import fetch_transactions
from langchain_core.tools import tool, InjectedToolCallId
from langgraph.types import Command
from langgraph.prebuilt import InjectedState
from typing import Annotated
from langchain_core.messages import ToolMessage


@tool(parse_docstring= True)
def check_structuring(tool_call_id: Annotated[str, InjectedToolCallId], aml_state: Annotated[AmlState, InjectedState]) -> Command:
    """
    Analyzes the wallet's transactions to identify structuring behaviour.
    
    Args:
        tool_call_id: The unique identifier for this tool call.
        aml_state: The current state containing wallet address.
    """

    transactions = fetch_transactions(aml_state['wallet_address'])
    print("behaviour_check.py - fetched transactions:")
    print(transactions)
    transactions['amount'] = pd.to_numeric(transactions['amount'], errors= 'coerce')
    filtered_inputs = transactions[(transactions['amount'] < 10000) & (transactions['sender'] == aml_state['wallet_address'])]

    # Performing rolling window operations
    filtered_inputs['timestamp'] = pd.to_datetime(filtered_inputs['timestamp'], utc= True)
    filtered_inputs = filtered_inputs.sort_values('timestamp')
    filtered_inputs.set_index('timestamp', inplace= True)
    rolling_sum = filtered_inputs['amount'].rolling('24h').sum()

    if any(rolling_sum > 10000):
        tool_message = ToolMessage(
            tool_call_id= tool_call_id,
            content= "Structuring behaviour detected: Multiple transactions below $10,000 within 24 hours exceeding $10,000."
        )
    else:
        tool_message = ToolMessage(
            tool_call_id= tool_call_id,
            content= "No structuring behaviour detected."
        )
        
    
    return Command(
        update= {
            "messages": [tool_message]
        })






