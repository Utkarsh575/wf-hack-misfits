#!/bin/bash

# --- Script to clean up the wasmd Docker environment ---

# Stop the running wasmd container
echo "Stopping wasmd container..."
docker stop wasmd || true

# Remove the wasmd container
echo "Removing wasmd container..."
docker rm wasmd || true

# Remove the data volume to clear all chain data
echo "Removing wasmd_data volume..."
docker volume rm -f wasmd_data

echo "Cleanup complete. The wasmd container and its data have been removed."
