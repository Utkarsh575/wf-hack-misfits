#!/bin/bash

# --- Step 0: Check and pull the required Docker image ---
echo "Checking for the 'soumithbasina/wfblockchain:latest' image locally..."
if [[ "$(docker images -q soumithbasina/wfblockchain:latest 2> /dev/null)" == "" ]]; then
  echo "Image not found. Pulling the latest image..."
  docker pull --platform linux/amd64 soumithbasina/wfblockchain:latest
else
  echo "Image found. Skipping pull."
fi

# --- Step 1: Clean up any existing environment ---
echo "Stopping and removing any existing 'wasmd' container..."
# The `|| true` ensures the script doesn't exit with an error if the container is not running.
docker stop wasmd || true

echo "Removing the 'wasmd_data' volume to clear all chain data..."
docker volume rm -f wasmd_data

# --- Step 2: Initialize the blockchain chain state and wallets ---
echo "Initializing a new chain and setting up wallets..."
# This command runs the setup script inside a temporary Docker container.
docker run --rm -it --name wasmd_init --mount type=volume,source=wasmd_data,target=//root/.wasmd soumithbasina/wfblockchain:latest //opt/setup_wasmd.sh

# --- Step 3: Run the blockchain container ---
echo "Starting the wasmd blockchain container..."
# This command starts the blockchain, mapping the necessary ports and mounting the data volume.
# The `--name wasmd` assigns a name to the container for easy reference later.
docker run --name wasmd -it -p 26657:26657 -p 26656:26656 -p 1317:1317 --mount type=volume,source=wasmd_data,target=//root/.wasmd soumithbasina/wfblockchain:latest //opt/run_wasmd.sh
