#!/bin/bash

echo "🚀 启动AI旅行规划师..."

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker未安装，请先安装Docker"
    exit 1
fi

# 检查Docker是否运行
if ! docker info &> /dev/null; then
    echo "❌ Docker未运行，请启动Docker"
    exit 1
fi

echo "📦 构建Docker镜像..."
docker build -t ai-travel-planner .

if [ $? -eq 0 ]; then
    echo "✅ 镜像构建成功"
    
    echo "🔄 停止现有容器（如果存在）..."
    docker stop ai-travel-planner 2>/dev/null || true
    docker rm ai-travel-planner 2>/dev/null || true
    
    echo "🚀 启动应用容器..."
    docker run -d \
        --name ai-travel-planner \
        -p 3000:80 \
        --restart unless-stopped \
        ai-travel-planner
    
    if [ $? -eq 0 ]; then
        echo "✅ 应用启动成功！"
        echo "🌐 访问地址: http://localhost:3000"
        echo "📋 容器状态: docker ps | grep ai-travel-planner"
        echo "📝 查看日志: docker logs ai-travel-planner"
        echo "🛑 停止应用: docker stop ai-travel-planner"
    else
        echo "❌ 应用启动失败"
        exit 1
    fi
else
    echo "❌ 镜像构建失败"
    exit 1
fi