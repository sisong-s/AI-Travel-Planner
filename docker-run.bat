@echo off
REM AI Travel Planner - Docker Run Script for Windows
REM This script will run the AI Travel Planner Docker container

echo ========================================
echo AI Travel Planner - Docker Deployment
echo ========================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not running!
    echo Please start Docker Desktop and try again.
    echo.
    pause
    exit /b 1
)

echo [INFO] Docker is running...
echo.

REM Stop and remove existing container if it exists
echo [INFO] Checking for existing container...
docker ps -a | findstr ai-travel-planner >nul 2>&1
if %errorlevel% equ 0 (
    echo [INFO] Stopping existing container...
    docker stop ai-travel-planner >nul 2>&1
    echo [INFO] Removing existing container...
    docker rm ai-travel-planner >nul 2>&1
)
echo.

REM Check if image exists
echo [INFO] Checking if Docker image exists...
docker images | findstr ai-travel-planner >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker image not found!
    echo Please import the image first using:
    echo docker load -i ai-travel-planner-docker-image.tar
    echo.
    pause
    exit /b 1
)

echo [INFO] Image found!
echo.

REM Run the container
echo [INFO] Starting AI Travel Planner container...
echo [INFO] Container will be available at: http://localhost:3000
echo.

docker run -d ^
  --name ai-travel-planner ^
  -p 3000:80 ^
  --restart unless-stopped ^
  ai-travel-planner:latest

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo [SUCCESS] Container started successfully!
    echo ========================================
    echo.
    echo Application is starting up...
    echo Please wait 30 seconds, then open your browser to:
    echo.
    echo   http://localhost:3000
    echo.
    echo Useful commands:
    echo   - View logs:     docker logs ai-travel-planner
    echo   - Stop:          docker stop ai-travel-planner
    echo   - Start:         docker start ai-travel-planner
    echo   - Restart:       docker restart ai-travel-planner
    echo.
    echo Press any key to view container logs...
    pause >nul
    docker logs ai-travel-planner
) else (
    echo.
    echo [ERROR] Failed to start container!
    echo Please check the error message above.
    echo.
)

echo.
pause
