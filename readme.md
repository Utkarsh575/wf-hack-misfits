to run the ts server

npm i

npm run dev

Fetching Transactions
This command fetches the transaction records for the given address. Replace the address with the one you want to query.

curl "http://localhost:3000/transactions/wasm12gcpk8rsezs5lfjq2xmp0rd69e6k8gx02u7yv5"
Checking Sanction Status
This command checks if a specific wallet address is on the sanctioned list.

curl "http://localhost:3000/sanctions/check/wasm12gcpk8rsezs5lfjq2xmp0rd69e6k8gx02u7yv5"
Adding a Sanctioned Wallet
This command adds a new address to the in-memory sanctioned list. You'll need to send a POST request with the address in a JSON body.

curl -X POST -H "Content-Type: application/json" -d '{"address": "new_sanctioned_wallet"}' http://localhost:3000/sanctions/add

Here are the corrected request bodies using the proper denom (`"ustake"`):

---

instantiate contract 

{
  "oracle_pubkey": "AjrX9BclyF9K8drtbJ+0+FBbGsS4Pg+UjPiYfBT7nRh2",
  "oracle_key_type": "secp256k1"
}

### `/oracle/sign-receive` (POST)

```json
{
  "sender": "wasm1senderaddress",
  "amount": "1000",
  "nonce": "12345"
}
```

---

### `/execute` (POST)

```json
{
  "mnemonic": "your mnemonic phrase here",
  "contract": "wasm1contractaddresshere",
  "msg": {
    "receive": {
      "amount": "1000",
      "from": "wasm1senderaddress"
    }
  },
  "amount": "0",
  "denom": "ustake"
}
```

Replace the example values with your actual data as needed. Let me know if you need a sample response or further help!
