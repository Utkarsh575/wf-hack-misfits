#!/bin/bash
# Example cURL commands for the AML Oracle Project (Oracle Service endpoints)

# 1. Execute a contract message (dev only)
curl -X POST http://localhost:8080/execute \
  -H 'Content-Type: application/json' \
  -d '{"mnemonic": "<mnemonic>", "contract": "<contract_addr>", "msg": {}, "amount": "1000", "denom": "uatom"}'

# 2. Get contract's bank balance
curl "http://localhost:8080/contract-balance?address=<contract_addr>"

# 3. Get wallet's bank balance
curl "http://localhost:8080/wallet-balance?address=<wallet_addr>"

# 4. Get all sanctioned addresses
curl http://localhost:8080/sanctions/all

# 5. Get all mixer addresses
curl http://localhost:8080/mixers/all

# 6. Get all darknet addresses
curl http://localhost:8080/darknet/all

# 7. Get a signature for a receive transaction
curl -X POST http://localhost:8080/oracle/sign-receive \
  -H 'Content-Type: application/json' \
  -d '{"sender": "<wallet_addr>", "amount": "1000", "nonce": "1"}'

# 8. Get transactions for a wallet address
curl http://localhost:8080/transactions/<wallet_addr>

# 9. Check if an address is sanctioned
curl http://localhost:8080/sanctions/check/<wallet_addr>

# 10. Add an address to the sanctions list
curl -X POST http://localhost:8080/sanctions/add \
  -H 'Content-Type: application/json' \
  -d '{"address": "<wallet_addr>"}'

# 11. Check if an address is a mixer
curl http://localhost:8080/mixers/check/<wallet_addr>

# 12. Add an address to the mixer list
curl -X POST http://localhost:8080/mixers/add \
  -H 'Content-Type: application/json' \
  -d '{"address": "<wallet_addr>"}'

# 13. Check if an address is a darknet wallet
curl http://localhost:8080/darknet/check/<wallet_addr>

# 14. Add an address to the darknet list
curl -X POST http://localhost:8080/darknet/add \
  -H 'Content-Type: application/json' \
  -d '{"address": "<wallet_addr>"}'

# 15. Wallet-to-wallet transfer
curl -X POST http://localhost:8080/wallet-transfer \
  -H 'Content-Type: application/json' \
  -d '{"from": "<wallet_addr>", "to": "<wallet_addr>", "amount": "1000", "denom": "uatom"}'

# Replace <wallet_addr>, <contract_addr>, <mnemonic>, etc. with actual values.
