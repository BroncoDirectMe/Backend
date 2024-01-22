#!/bin/bash

# Check if the Docker container bdm-db exists
if ! docker ps -a --format '{{.Names}}' | grep -q bdm-db; then
    echo "Docker container bdm-db doesn't exist, nothing to reset."
else
    echo "Removing Docker container"
    docker stop bdm-db > /dev/null
    docker remove bdm-db > /dev/null
fi

echo "Starting new Docker container"
source ./scripts/db-start.sh
