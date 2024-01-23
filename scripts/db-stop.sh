#!/bin/bash

# Check if the Docker container bdm-db exists
if ! docker ps -a --format '{{.Names}}' | grep -q bdm-db; then
    echo "Docker container bdm-db doesn't exist, nothing to stop."
    exit 1
fi

docker stop bdm-db