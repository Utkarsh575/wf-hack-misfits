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
