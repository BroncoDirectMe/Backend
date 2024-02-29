#!/bin/bash

# If bdm-db isn't 
if ! command -v docker &> /dev/null; then
    echo "Docker isn't installed, please install it here: https://www.docker.com/products/docker-desktop/"
    exit 1
fi

# Check if the Docker container bdm-db exists
if ! docker ps -a --format '{{.Names}}' | grep -q bdm-db; then
    echo "Docker container doesn't exist, making new one."
    docker run --name bdm-db -h 127.0.0.1 -p 3306:3306 -e MYSQL_ROOT_PASSWORD=password -e MYSQL_DATABASE=broncoDirectMeDB -d mysql:latest > /dev/null
fi 

docker start bdm-db > /dev/null
echo "Docker db container created"