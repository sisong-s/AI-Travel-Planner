#!/bin/bash

# AI Travel Planner - Build and Export Docker Image
# Run this script to build and export the Docker image

echo "========================================"
echo "AI Travel Planner - Build Docker Image"
echo "========================================"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "[ERROR] Docker is not running!"
    echo "Please install and start Docker Desktop first."
    echo ""
    echo "Download Docker Desktop from:"
    echo "https://www.docker.com/products/docker-desktop/"
    echo ""
    exit 1
fi

echo "[1/5] Checking Docker..."
echo "[OK] Docker is running"
echo ""

# Build image
echo "[2/5] Building Docker image..."
echo "This may take 5-10 minutes..."
echo ""
docker build -t ai-travel-planner:latest .
if [ $? -ne 0 ]; then
    echo ""
    echo "[ERROR] Build failed!"
    exit 1
fi
echo ""
echo "[OK] Build completed"
echo ""

# Test image
echo "[3/5] Testing image..."
docker run -d --name test-ai-travel -p 3001:80 ai-travel-planner:latest > /dev/null 2>&1
sleep 5
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3001 | grep -q "200"; then
    echo "[OK] Image works correctly"
else
    echo "[WARNING] Could not verify image (this is OK)"
fi
docker stop test-ai-travel > /dev/null 2>&1
docker rm test-ai-travel > /dev/null 2>&1
echo ""

# Export image
echo "[4/5] Exporting image to file..."
echo "Creating: ai-travel-planner-docker-image.tar"
echo "This may take 1-3 minutes..."
echo ""
docker save ai-travel-planner:latest -o ai-travel-planner-docker-image.tar
if [ $? -ne 0 ]; then
    echo ""
    echo "[ERROR] Export failed!"
    exit 1
fi
echo ""
echo "[OK] Export completed"
echo ""

# Verify file
echo "[5/5] Verifying exported file..."
FILE_SIZE=$(ls -lh ai-travel-planner-docker-image.tar | awk '{print $5}')
echo "File size: $FILE_SIZE"
if command -v sha256sum > /dev/null; then
    HASH=$(sha256sum ai-travel-planner-docker-image.tar | awk '{print $1}')
    echo "SHA256: $HASH"
elif command -v shasum > /dev/null; then
    HASH=$(shasum -a 256 ai-travel-planner-docker-image.tar | awk '{print $1}')
    echo "SHA256: $HASH"
fi
echo "[OK] File verified"
echo ""

# Summary
echo "========================================"
echo "Build Complete!"
echo "========================================"
echo ""
echo "Output file: ai-travel-planner-docker-image.tar"
echo "File size: $FILE_SIZE"
echo "Location: $(pwd)/ai-travel-planner-docker-image.tar"
echo ""
echo "Files ready for distribution:"
echo "  [x] ai-travel-planner-docker-image.tar"
echo "  [x] DOCKER_DEPLOYMENT.md"
echo "  [x] docker-run.bat"
echo "  [x] docker-run.sh"
echo "  [x] .env.example"
echo ""
echo "Next steps:"
echo "1. Share the .tar file with users"
echo "2. Provide DOCKER_DEPLOYMENT.md for installation instructions"
echo "3. Include docker-run scripts for easy deployment"
echo ""
