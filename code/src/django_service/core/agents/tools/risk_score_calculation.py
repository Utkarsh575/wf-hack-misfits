from langchain_core.tools import tool, InjectedToolCallId
from langgraph.types import Command
from langgraph.prebuilt import InjectedState
from typing import Annotated, List, Union
from langchain_openai import ChatOpenAI
import os
from dotenv import load_dotenv, find_dotenv
from pydantic import SecretStr

from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import ToolMessage
from core.agents.models.aml_state import AmlState

load_dotenv(find_dotenv())

@tool(parse_docstring=True)
def compute_risk_score(
    analysis_results: List[Union[str, dict]],
    tool_call_id: Annotated[str, InjectedToolCallId],
    aml_state: Annotated[AmlState, InjectedState]
) -> Command:
    """
    Computes a risk score for the given wallet address based on the analysis results.
    Only human-readable summary strings should be used for the risk scoring prompt.
    Structured objects (like failedChecks) are ignored for the prompt.
    
    Args:
        analysis_results: List of summary strings and/or dicts from previous tools.
        tool_call_id: The unique identifier for this tool call.
        aml_state: The current state containing analysis results.
    """
    # Extract only summary strings for the prompt
    summary_strings = []
    for item in analysis_results:
        if isinstance(item, str):
            summary_strings.append(item)
        elif isinstance(item, dict):
            # If dict has a 'message' field, use it as a summary
            msg = item.get("message")
            if msg and isinstance(msg, str):
                summary_strings.append(msg)
    # Remove duplicates
    summary_strings = list(dict.fromkeys(summary_strings))

    # Compose prompt
    reasoning_model = ChatOpenAI(
        model="gpt-4o-mini",
        temperature=0,
        api_key=SecretStr(os.getenv('OPENAI_API_KEY', ''))
    )

    prompt = ChatPromptTemplate.from_messages([
        ("system", (
            "You are an expert financial risk analyst tasked with conducting risk analysis associated with crypto transactions. "
            "Based on the analysis results provided below, calculate a risk score between 1 and 10 (both inclusive) with 10 being the highest. "
            "The score should be an integer. Respond with only the calculated value (no explanation). "
            "The analysis results are as follows:\n\n{analysis_results}"
        )),
    ])

    chain = prompt | reasoning_model | StrOutputParser()
    compute_risk_score = chain.invoke({"analysis_results": "\n".join(summary_strings)})

    return Command(
        update={
            "risk_score": int(compute_risk_score),
            "messages": [ToolMessage(tool_call_id=tool_call_id, content=f"Computed risk score: {compute_risk_score}")]
        }
    )