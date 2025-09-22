
from core.agents.models.aml_state import AmlState
from core.agents.tools.fetch_transactions import fetch_transactions
from langchain_core.tools import tool, InjectedToolCallId
from langgraph.types import Command
from langgraph.prebuilt import InjectedState
from typing import Annotated
from langchain_core.messages import ToolMessage

import pandas as pd
import requests

@tool(parse_docstring=True)
def check_sanctions(tool_call_id: Annotated[str, InjectedToolCallId], aml_state: Annotated[AmlState, InjectedState]) -> Command:
    """
    Checks if the wallet address carried out transactions with any sanctioned, mixer, or darknet entities.
    The checks are performed up to n hops as designated in the state.

    Args:
        tool_call_id: The unique identifier for this tool call.
        aml_state: The current state containing wallet address.
    """
    # Fetch lists from the oracle-service API
    sanctions_resp = requests.get("http://localhost:8080/sanctions/all")
    sanctions_resp.raise_for_status()
    sanctions_data = sanctions_resp.json()
    sanctions_set = set(sanctions_data.get("sanctioned", []))

    mixers_resp = requests.get("http://localhost:8080/mixers/all")
    mixers_resp.raise_for_status()
    mixers_data = mixers_resp.json()
    mixers_set = set(mixers_data.get("mixers", []))

    darknet_resp = requests.get("http://localhost:8080/darknet/all")
    darknet_resp.raise_for_status()
    darknet_data = darknet_resp.json()
    darknet_set = set(darknet_data.get("darknet", []))

    wallet = aml_state['wallet_address']
    max_hops = aml_state.get('max_hops', 1)

    flagged_transactions = []
    flagged_types = set()
    direct_flag = None
    failed_checks = []

    # Check if the wallet itself is directly flagged
    if wallet in sanctions_set:
        direct_flag = "sanctioned"
    elif wallet in mixers_set:
        direct_flag = "mixer"
    elif wallet in darknet_set:
        direct_flag = "darknet"

    if direct_flag:
        failed_checks.append({
            "type": direct_flag,
            "wallet": wallet,
            "transactions": [],
            "message": f"Wallet {wallet} is directly flagged as {direct_flag}."
        })
        result = {
            "flagged": True,
            "type": direct_flag,
            "wallet": wallet,
            "transactions": [],
            "failedChecks": failed_checks,
            "message": f"Wallet {wallet} is directly flagged as {direct_flag}."
        }
        tool_message = ToolMessage(
            tool_call_id=tool_call_id,
            content=result
        )
        return Command(update={"messages": [tool_message]})

    current_addresses = [wallet]
    analyzed_addresses = set([wallet])

    # Group flagged transactions by type and hop
    grouped_flags = {}

    for hop in range(max_hops):
        next_addresses = set()
        for address in current_addresses:
            transactions = fetch_transactions(address)
            # If transactions is a DataFrame, convert to records
            if hasattr(transactions, 'to_dict'):
                tx_records = transactions.to_dict(orient='records')
            else:
                tx_records = transactions if isinstance(transactions, list) else []
            for tx in tx_records:
                sender = tx.get('sender')
                receiver = tx.get('receiver')
                tx_type = None
                flagged_entity = None
                if sender in sanctions_set or receiver in sanctions_set:
                    tx_type = "sanctioned"
                    flagged_entity = sender if sender in sanctions_set else receiver
                elif sender in mixers_set or receiver in mixers_set:
                    tx_type = "mixer"
                    flagged_entity = sender if sender in mixers_set else receiver
                elif sender in darknet_set or receiver in darknet_set:
                    tx_type = "darknet"
                    flagged_entity = sender if sender in darknet_set else receiver
                if tx_type:
                    flagged_types.add(tx_type)
                    key = (tx_type, hop + 1)
                    if key not in grouped_flags:
                        grouped_flags[key] = []
                    grouped_flags[key].append({
                        "flagged_entity": flagged_entity,
                        "transaction": tx
                    })
                # Prepare for next hop
                for party in [sender, receiver]:
                    if party and party not in analyzed_addresses:
                        next_addresses.add(party)
            analyzed_addresses.add(address)
        current_addresses = list(next_addresses)

    # Add grouped messages for each flagged type/hop as structured objects
    for (tx_type, hop), txs in grouped_flags.items():
        failed_checks.append({
            "type": tx_type,
            "wallet": wallet,
            "hop": hop,
            "transactions": [t["transaction"] for t in txs],
            "message": f"{tx_type.capitalize()} entity transaction(s) detected for address at hop {hop}."
        })

    result = {
        "flagged": bool(grouped_flags),
        "types": list(flagged_types),
        "wallet": wallet,
        "transactions": grouped_flags,
        "failedChecks": failed_checks,
        "message": f"Flagged transactions detected for wallet {wallet}." if grouped_flags else "No sanctioned, mixer, or darknet entity transactions detected."
    }

    tool_message = ToolMessage(
        tool_call_id=tool_call_id,
        content=result
    )
    return Command(update={"messages": [tool_message]})