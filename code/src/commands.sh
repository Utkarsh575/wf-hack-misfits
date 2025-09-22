docker pull --platform linux/amd64 soumithbasina/wfblockchain:latest

docker run --rm -it --mount type=volume,source=wasmd_data,target=//root/.wasmd soumithbasina/wfblockchain:latest //opt/setup_wasmd.sh


docker run --rm -it -p 26657:26657 -p 26656:26656 -p 1317:1317 --mount type=volume,source=wasmd_data,target=//root/.wasmd soumithbasina/wfblockchain:latest //opt/run_wasmd.sh


docker volume rm -f wasmd_data


wasmd query txs --events 'transfer.recipient=<wasm12gcpk8rsezs5lfjq2xmp0rd69e6k8gx02u7yv5>'


-- ts-code-gen

cosmwasm-ts-codegen generate --plugin client --schema ./schema --out ../oracle-service/src/sdk  --name oracle





--- inside docker exec 


# wasmd tx bank send validator <your_wallet_address> 100000000ustake \
#   --from validator \
#   --chain-id testing \
#   --keyring-backend test \
#   --home /root/.wasmd \
#   --yes

#   wasm1sse6pdmn5s7epjycxadjzku4qfgs604cgur6me


  wasmd tx bank send validator wasm1sse6pdmn5s7epjycxadjzku4qfgs604cgur6me 100000000ustake \
  --from validator \
  --chain-id testing \
  --keyring-backend test \
  --home /root/.wasmd \
  --yes

--
contract address:
wasm14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9s0phg4d


wasm1sse6pdmn5s7epjycxadjzku4qfgs604cgur6me

rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install uvicorn
uvicorn django_service.asgi:application --host 0.0.0.0 --port 8000 --reload

instantiate contract 

{
  "oracle_pubkey": "AjrX9BclyF9K8drtbJ+0+FBbGsS4Pg+UjPiYfBT7nRh2",
  "oracle_key_type": "secp256k1"
}