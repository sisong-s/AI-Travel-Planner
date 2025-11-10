@echo off
chcp 65001 >nul

echo 🚀 启动AI旅行规划师...

REM 检查Docker是否安装
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker未安装，请先安装Docker Desktop
    pause
    exit /b 1
)

REM 检查Docker是否运行
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker未运行，请启动Docker Desktop
    pause
    exit /b 1
)

echo 📦 构建Docker镜像...
docker build -t ai-travel-planner .

if %errorlevel% equ 0 (
    echo ✅ 镜像构建成功
    
    echo 🔄 停止现有容器（如果存在）...
    docker stop ai-travel-planner >nul 2>&1
    docker rm ai-travel-planner >nul 2>&1
    
    echo 🚀 启动应用容器...
    docker run -d --name ai-travel-planner -p 3000:80 --restart unless-stopped ai-travel-planner
    
    if %errorlevel% equ 0 (
        echo ✅ 应用启动成功！
        echo 🌐 访问地址: http://localhost:3000
        echo 📋 容器状态: docker ps ^| findstr ai-travel-planner
        echo 📝 查看日志: docker logs ai-travel-planner
        echo 🛑 停止应用: docker stop ai-travel-planner
        echo.
        echo 按任意键打开浏览器...
        pause >nul
        start http://localhost:3000
    ) else (
        echo ❌ 应用启动失败
        pause
        exit /b 1
    )
) else (
    echo ❌ 镜像构建失败
    pause
    exit /b 1
)