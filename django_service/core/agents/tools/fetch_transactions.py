# Fetch all transactions conducted by this wallet from api service

import pandas as pd
import json

def fetch_transactions(wallet_address: str) -> pd.DataFrame:
    with open("test_data.json", "r") as f:
        # TODO: Replace static file read with actual API call
        wallet_transactions_api_response = f.read()
    
    
    data = json.loads(wallet_transactions_api_response)
    transactions = pd.DataFrame(data["transactions"])
    return transactions



    
