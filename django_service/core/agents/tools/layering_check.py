
import requests
from datetime import datetime
from typing import Annotated
import pandas as pd
from langchain_core.tools import tool, InjectedToolCallId
from langgraph.types import Command
from langgraph.prebuilt import InjectedState
from langchain_core.messages import ToolMessage
from core.agents.models.aml_state import AmlState


@tool(parse_docstring=True)
def check_layering(
    tool_call_id: Annotated[str, InjectedToolCallId],
    aml_state: Annotated[AmlState, InjectedState],
    api_url: str,
    max_hops: int = 3,
    rapid_window: int = 300
) -> Command:
    """
    Detects layering (circular or rapid fund transfers) in a wallet's transactions.

    Args:
        tool_call_id (str): The unique identifier for this tool call.
        aml_state (AmlState): The current state containing wallet address.
        api_url (str): Endpoint to fetch transaction history of a wallet.
        max_hops (int, optional): Maximum depth for recursive n-hop exploration.
        rapid_window (int, optional): Time (in seconds) considered "rapid" transfer.

    Returns:
        Command: The result of the layering analysis.
    """

    origin = aml_state['wallet_address']
    cache = {}
    recorded_cycles = set()
    evidence = []

    def fetch_transactions(address: str):
        if address in cache:
            return cache[address]
        try:
            # Always use the Node.js backend for transactions
            resp = requests.get(f"http://localhost:8080/transactions/{address}", timeout=5)
            txs = resp.json().get("transactions", [])
        except Exception as e:
            print(f"[Layering Tool] API error for {address}: {e}")
            txs = []
        cache[address] = txs
        return txs

    def trace(origin: str, current: str, path=None, visited=None, start_ts=None):
        nonlocal evidence
        if path is None:
            path = [origin]
        if visited is None:
            visited = set([origin])

        if len(path) > max_hops + 1:
            return

        transactions = fetch_transactions(current)
        for tx in transactions:
            counterparty = tx["receiver"] if tx["sender"] == current else tx["sender"]
            ts = datetime.fromisoformat(tx["timestamp"].replace("Z", "+00:00"))

            if counterparty in visited and counterparty != origin:
                continue

            new_path = path + [counterparty]
            new_visited = visited | {counterparty}

            # Only count cycles that are longer than 2 (not direct send/receive)
            if counterparty == origin and len(new_path) > 3:
                # Canonicalize cycle: rotate so smallest address is first
                min_idx = min(range(len(new_path)), key=lambda i: new_path[i])
                canonical_cycle = tuple(new_path[min_idx:] + new_path[:min_idx])
                if canonical_cycle not in recorded_cycles:
                    recorded_cycles.add(canonical_cycle)
                    first_ts = start_ts or ts
                    last_ts = ts
                    duration = max(0, (last_ts - first_ts).total_seconds())
                    if duration <= rapid_window:
                        evidence.append(f"Rapid layering cycle: {' -> '.join(new_path)} in {int(duration)}s")
                    else:
                        evidence.append(f"Cyclic transfer: {' -> '.join(new_path)} over {int(duration)}s")
                continue

            trace(origin, counterparty, new_path, new_visited, start_ts or ts)

    # Start tracing from each counterparty
    txs = fetch_transactions(origin)
    for tx in txs:
        for counterparty in [tx["sender"], tx["receiver"]]:
            if counterparty != origin:
                ts = datetime.fromisoformat(tx["timestamp"].replace("Z", "+00:00"))
                trace(origin, counterparty, path=[origin, counterparty], visited={origin, counterparty}, start_ts=ts)

    # Compute score and decision
    score = 0.0
    decision = False
    for ev in evidence:
        if "Rapid layering" in ev:
            score += 0.8
            decision = True
        elif "Cyclic transfer" in ev:
            score += 0.3
    score = min(score, 1.0)

    if not decision and score >= 0.8:
        decision = True

    tool_message = ToolMessage(
        tool_call_id=tool_call_id,
        content=f"Layering analysis: {len(evidence)} cycles detected"
    )

    return Command(
        update={
            "messages": [tool_message]
            # "layering_result": {
            #     "agent": "Layering Agent",
            #     "score": score,
            #     "decision": decision,
            #     "evidence": evidence
            # }
        }
    )
