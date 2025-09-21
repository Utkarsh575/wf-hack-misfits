from core.agents.models.aml_state import AmlState
from core.agents.tools.fetch_transactions import fetch_transactions
from langchain_core.tools import tool, InjectedToolCallId
from langgraph.types import Command
from langgraph.prebuilt import InjectedState
from typing import Annotated
from langchain_core.messages import ToolMessage
import pandas as pd

@tool(parse_docstring= True)
def check_sanctions(tool_call_id: Annotated[str, InjectedToolCallId], aml_state: Annotated[AmlState, InjectedState]) -> Command:
    """
    Checks if the wallet address carried out transactions with any sanctioned entities.
    The checks are performed upto hop of n. This vaue is designated in the state. 
    
    Args:
        tool_call_id: The unique identifier for this tool call.
        aml_state: The current state containing wallet address.
    """
    
    sanctions_df = pd.read_json("sanctions_list.json", orient= 'records')
    current_addresses = [aml_state['wallet_address']]
    analyzed_addresses = set()

    tool_message = ToolMessage(
        tool_call_id= tool_call_id,
        content= "No sanctioned entity transactions detected."
    )

    for hop in range(aml_state['max_hops']):
        # Retrieve all entities that current addresses have transacted with (either as sender or receiver)
        next_addresses = set()
        for address in current_addresses:
            transactions = fetch_transactions(address)

            # Check if any transactions involve sanctioned entities
            sanctioned_transactions = transactions[
                (transactions['sender'].isin(sanctions_df['wallet_address'])) | 
                (transactions['receiver'].isin(sanctions_df['wallet_address']))
            ]
            
            if not sanctioned_transactions.empty:
                tool_message = ToolMessage(
                    tool_call_id= tool_call_id,
                    content= f"Sanctioned entity transaction detected for address at a hop {hop+1}: {sanctioned_transactions.to_dict(orient= 'records')}"
                )
            
            next_wallets = (pd.Series(pd.concat([transactions['sender'], transactions['receiver']]).unique()))

            next_addresses.update(next_wallets[~next_wallets.isin(analyzed_addresses)].tolist())
            analyzed_addresses.add(address)
        
        current_addresses = list(next_addresses)


    
    return Command(
        update= {
            "messages": [tool_message]
        })