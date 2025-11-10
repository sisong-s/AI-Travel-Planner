#!/bin/bash

# AI Travel Planner - Docker Run Script for Mac/Linux
# This script will run the AI Travel Planner Docker container

echo "========================================"
echo "AI Travel Planner - Docker Deployment"
echo "========================================"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "[ERROR] Docker is not running!"
    echo "Please start Docker Desktop and try again."
    echo ""
    exit 1
fi

echo "[INFO] Docker is running..."
echo ""

# Stop and remove existing container if it exists
echo "[INFO] Checking for existing container..."
if docker ps -a | grep -q ai-travel-planner; then
    echo "[INFO] Stopping existing container..."
    docker stop ai-travel-planner > /dev/null 2>&1
    echo "[INFO] Removing existing container..."
    docker rm ai-travel-planner > /dev/null 2>&1
fi
echo ""

# Check if image exists
echo "[INFO] Checking if Docker image exists..."
if ! docker images | grep -q ai-travel-planner; then
    echo "[ERROR] Docker image not found!"
    echo "Please import the image first using:"
    echo "  docker load -i ai-travel-planner-docker-image.tar"
    echo ""
    exit 1
fi

echo "[INFO] Image found!"
echo ""

# Run the container
echo "[INFO] Starting AI Travel Planner container..."
echo "[INFO] Container will be available at: http://localhost:3000"
echo ""

docker run -d \
  --name ai-travel-planner \
  -p 3000:80 \
  --restart unless-stopped \
  ai-travel-planner:latest

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================"
    echo "[SUCCESS] Container started successfully!"
    echo "========================================"
    echo ""
    echo "Application is starting up..."
    echo "Please wait 30 seconds, then open your browser to:"
    echo ""
    echo "  http://localhost:3000"
    echo ""
    echo "Useful commands:"
    echo "  - View logs:     docker logs ai-travel-planner"
    echo "  - Follow logs:   docker logs -f ai-travel-planner"
    echo "  - Stop:          docker stop ai-travel-planner"
    echo "  - Start:         docker start ai-travel-planner"
    echo "  - Restart:       docker restart ai-travel-planner"
    echo ""
    echo "Press Enter to view container logs..."
    read
    docker logs ai-travel-planner
else
    echo ""
    echo "[ERROR] Failed to start container!"
    echo "Please check the error message above."
    echo ""
    exit 1
fi

echo ""
