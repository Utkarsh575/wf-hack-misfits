
import pandas as pd
import requests

def fetch_transactions(wallet_address: str) -> pd.DataFrame:
    url = f"http://localhost:8080/transactions/{wallet_address}"
    response = requests.get(url)
    response.raise_for_status()
    data = response.json()
    transactions = pd.DataFrame(data["transactions"])
    return transactions



    
