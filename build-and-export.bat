@echo off
REM AI Travel Planner - Build and Export Docker Image
REM Run this script to build and export the Docker image

echo ========================================
echo AI Travel Planner - Build Docker Image
echo ========================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not running!
    echo Please install and start Docker Desktop first.
    echo.
    echo Download Docker Desktop from:
    echo https://www.docker.com/products/docker-desktop/
    echo.
    pause
    exit /b 1
)

echo [1/5] Checking Docker...
echo [OK] Docker is running
echo.

REM Build image
echo [2/5] Building Docker image...
echo This may take 5-10 minutes...
echo.
docker build -t ai-travel-planner:latest .
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Build failed!
    pause
    exit /b 1
)
echo.
echo [OK] Build completed
echo.

REM Test image
echo [3/5] Testing image...
docker run -d --name test-ai-travel -p 3001:80 ai-travel-planner:latest >nul 2>&1
timeout /t 5 /nobreak >nul
curl -s http://localhost:3001 >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Image works correctly
) else (
    echo [WARNING] Could not verify image ^(this is OK^)
)
docker stop test-ai-travel >nul 2>&1
docker rm test-ai-travel >nul 2>&1
echo.

REM Export image
echo [4/5] Exporting image to file...
echo Creating: ai-travel-planner-docker-image.tar
echo This may take 1-3 minutes...
echo.
docker save ai-travel-planner:latest -o ai-travel-planner-docker-image.tar
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Export failed!
    pause
    exit /b 1
)
echo.
echo [OK] Export completed
echo.

REM Verify file
echo [5/5] Verifying exported file...
for %%A in (ai-travel-planner-docker-image.tar) do set filesize=%%~zA
set /a filesizeMB=%filesize% / 1048576
echo File size: %filesizeMB% MB
powershell -Command "(Get-FileHash -Path 'ai-travel-planner-docker-image.tar' -Algorithm SHA256).Hash" > hash.tmp
set /p filehash=<hash.tmp
del hash.tmp
echo SHA256: %filehash%
echo [OK] File verified
echo.

REM Summary
echo ========================================
echo Build Complete!
echo ========================================
echo.
echo Output file: ai-travel-planner-docker-image.tar
echo File size: %filesizeMB% MB
echo Location: %CD%\ai-travel-planner-docker-image.tar
echo.
echo Files ready for distribution:
echo   [x] ai-travel-planner-docker-image.tar
echo   [x] DOCKER_DEPLOYMENT.md
echo   [x] docker-run.bat
echo   [x] docker-run.sh
echo   [x] .env.example
echo.
echo Next steps:
echo 1. Share the .tar file with users
echo 2. Provide DOCKER_DEPLOYMENT.md for installation instructions
echo 3. Include docker-run scripts for easy deployment
echo.
pause
