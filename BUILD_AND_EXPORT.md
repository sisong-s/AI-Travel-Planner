# Docker 镜像构建和导出指南

本文档说明如何构建 Docker 镜像并导出为 .tar 文件，以便分享给其他用户。

## 🎯 构建和导出流程

### 步骤 1: 准备项目

确保项目根目录包含以下文件：
- `Dockerfile`
- `package.json`
- `nginx.conf`
- 完整的源代码

### 步骤 2: 构建 Docker 镜像

```bash
# 在项目根目录执行
docker build -t ai-travel-planner:latest .

# 构建过程大约需要 5-10 分钟
# 您会看到类似输出:
# [+] Building 234.5s (12/12) FINISHED
# => => naming to docker.io/library/ai-travel-planner:latest
```

**注意事项:**
- 确保已安装 Docker Desktop 并正在运行
- 构建过程需要稳定的网络连接（下载依赖）
- 建议在网络良好的环境下构建

### 步骤 3: 验证镜像

```bash
# 查看构建的镜像
docker images | grep ai-travel-planner

# 输出示例:
# REPOSITORY          TAG       IMAGE ID       CREATED         SIZE
# ai-travel-planner   latest    abc123def456   2 minutes ago   150MB

# 测试镜像是否正常运行
docker run -d --name test-container -p 3000:80 ai-travel-planner:latest

# 访问 http://localhost:3000 测试
# 测试完成后删除测试容器
docker stop test-container
docker rm test-container
```

### 步骤 4: 导出镜像为 .tar 文件

```bash
# 导出镜像（推荐使用压缩）
docker save ai-travel-planner:latest | gzip > ai-travel-planner-docker-image.tar.gz

# 或不压缩（文件更大但兼容性更好）
docker save ai-travel-planner:latest -o ai-travel-planner-docker-image.tar

# 导出过程大约需要 1-3 分钟
```

**文件大小参考:**
- 未压缩 (.tar): 约 400-600 MB
- 压缩 (.tar.gz): 约 150-250 MB

### 步骤 5: 验证导出的文件

```bash
# 检查文件大小
# Windows:
dir ai-travel-planner-docker-image.tar

# Mac/Linux:
ls -lh ai-travel-planner-docker-image.tar

# 验证文件完整性（可选）
# Windows PowerShell:
Get-FileHash ai-travel-planner-docker-image.tar -Algorithm SHA256

# Mac/Linux:
sha256sum ai-travel-planner-docker-image.tar
```

## 📦 完整的构建脚本

### Windows (PowerShell) - `build-and-export.ps1`

```powershell
# AI Travel Planner - Build and Export Script

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "AI Travel Planner - Build Docker Image" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Docker
Write-Host "[1/5] Checking Docker..." -ForegroundColor Yellow
docker info | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Docker is not running!" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Docker is running" -ForegroundColor Green
Write-Host ""

# Build image
Write-Host "[2/5] Building Docker image..." -ForegroundColor Yellow
Write-Host "This may take 5-10 minutes..." -ForegroundColor Gray
docker build -t ai-travel-planner:latest .
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Build completed" -ForegroundColor Green
Write-Host ""

# Test image
Write-Host "[3/5] Testing image..." -ForegroundColor Yellow
docker run -d --name test-ai-travel -p 3001:80 ai-travel-planner:latest
Start-Sleep -Seconds 5
$response = Invoke-WebRequest -Uri "http://localhost:3001" -UseBasicParsing -ErrorAction SilentlyContinue
docker stop test-ai-travel | Out-Null
docker rm test-ai-travel | Out-Null
if ($response.StatusCode -eq 200) {
    Write-Host "[OK] Image works correctly" -ForegroundColor Green
} else {
    Write-Host "[WARNING] Could not verify image" -ForegroundColor Yellow
}
Write-Host ""

# Export image
Write-Host "[4/5] Exporting image..." -ForegroundColor Yellow
Write-Host "Creating: ai-travel-planner-docker-image.tar" -ForegroundColor Gray
docker save ai-travel-planner:latest -o ai-travel-planner-docker-image.tar
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Export failed!" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Export completed" -ForegroundColor Green
Write-Host ""

# Verify file
Write-Host "[5/5] Verifying exported file..." -ForegroundColor Yellow
$file = Get-Item "ai-travel-planner-docker-image.tar"
$sizeInMB = [math]::Round($file.Length / 1MB, 2)
Write-Host "File size: $sizeInMB MB" -ForegroundColor Gray
$hash = (Get-FileHash -Path "ai-travel-planner-docker-image.tar" -Algorithm SHA256).Hash
Write-Host "SHA256: $hash" -ForegroundColor Gray
Write-Host "[OK] File verified" -ForegroundColor Green
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Build Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Output file: ai-travel-planner-docker-image.tar" -ForegroundColor White
Write-Host "File size: $sizeInMB MB" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Share the .tar file with users" -ForegroundColor White
Write-Host "2. Provide DOCKER_DEPLOYMENT.md for instructions" -ForegroundColor White
Write-Host "3. Include docker-run.bat/sh scripts" -ForegroundColor White
Write-Host ""
```

### Mac/Linux (Bash) - `build-and-export.sh`

```bash
#!/bin/bash

# AI Travel Planner - Build and Export Script

echo "========================================"
echo "AI Travel Planner - Build Docker Image"
echo "========================================"
echo ""

# Check Docker
echo "[1/5] Checking Docker..."
if ! docker info > /dev/null 2>&1; then
    echo "[ERROR] Docker is not running!"
    exit 1
fi
echo "[OK] Docker is running"
echo ""

# Build image
echo "[2/5] Building Docker image..."
echo "This may take 5-10 minutes..."
docker build -t ai-travel-planner:latest .
if [ $? -ne 0 ]; then
    echo "[ERROR] Build failed!"
    exit 1
fi
echo "[OK] Build completed"
echo ""

# Test image
echo "[3/5] Testing image..."
docker run -d --name test-ai-travel -p 3001:80 ai-travel-planner:latest
sleep 5
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3001 | grep -q "200"; then
    echo "[OK] Image works correctly"
else
    echo "[WARNING] Could not verify image"
fi
docker stop test-ai-travel > /dev/null 2>&1
docker rm test-ai-travel > /dev/null 2>&1
echo ""

# Export image
echo "[4/5] Exporting image..."
echo "Creating: ai-travel-planner-docker-image.tar"
docker save ai-travel-planner:latest -o ai-travel-planner-docker-image.tar
if [ $? -ne 0 ]; then
    echo "[ERROR] Export failed!"
    exit 1
fi
echo "[OK] Export completed"
echo ""

# Verify file
echo "[5/5] Verifying exported file..."
FILE_SIZE=$(ls -lh ai-travel-planner-docker-image.tar | awk '{print $5}')
echo "File size: $FILE_SIZE"
if command -v sha256sum > /dev/null; then
    HASH=$(sha256sum ai-travel-planner-docker-image.tar | awk '{print $1}')
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
echo ""
echo "Next steps:"
echo "1. Share the .tar file with users"
echo "2. Provide DOCKER_DEPLOYMENT.md for instructions"
echo "3. Include docker-run.bat/sh scripts"
echo ""
```

## 🚀 快速构建命令

如果您只想快速构建并导出，使用以下单行命令：

### Windows (PowerShell)
```powershell
docker build -t ai-travel-planner:latest . && docker save ai-travel-planner:latest -o ai-travel-planner-docker-image.tar
```

### Mac/Linux (Bash)
```bash
docker build -t ai-travel-planner:latest . && docker save ai-travel-planner:latest -o ai-travel-planner-docker-image.tar
```

## 📤 分发文件清单

准备以下文件供用户下载：

```
ai-travel-planner-release/
├── ai-travel-planner-docker-image.tar   # Docker 镜像文件（必需）
├── DOCKER_DEPLOYMENT.md                  # 部署文档（必需）
├── docker-run.bat                        # Windows 运行脚本（推荐）
├── docker-run.sh                         # Mac/Linux 运行脚本（推荐）
├── .env.example                          # 环境变量示例（可选）
├── README.md                             # 项目说明（可选）
└── QUICK_START.md                        # 快速开始指南（可选）
```

## 🔄 更新镜像流程

当需要更新应用时：

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 删除旧镜像
docker rmi ai-travel-planner:latest

# 3. 重新构建
docker build -t ai-travel-planner:latest .

# 4. 重新导出
docker save ai-travel-planner:latest -o ai-travel-planner-docker-image-v2.tar

# 5. 更新版本号或日期
mv ai-travel-planner-docker-image-v2.tar ai-travel-planner-docker-image-2024-01-10.tar
```

## 🗜️ 压缩和优化

### 使用 gzip 压缩（推荐）

```bash
# 导出并压缩
docker save ai-travel-planner:latest | gzip > ai-travel-planner-docker-image.tar.gz

# 用户导入时需要解压
# Windows:
# 使用 7-Zip 或 WinRAR 解压，然后 docker load -i ai-travel-planner-docker-image.tar

# Mac/Linux:
gunzip -c ai-travel-planner-docker-image.tar.gz | docker load
```

### 镜像优化建议

在 Dockerfile 中优化以减小镜像大小：

```dockerfile
# 使用 alpine 基础镜像（已采用）
FROM node:18-alpine

# 仅安装生产依赖
RUN npm ci --only=production

# 多阶段构建（已采用）
FROM nginx:alpine

# 清理不必要的文件
RUN rm -rf /var/cache/apk/*
```

## 📊 文件大小对比

| 方式 | 文件大小 | 传输时间 (10Mbps) | 优点 | 缺点 |
|------|----------|-------------------|------|------|
| .tar 未压缩 | 400-600 MB | 5-8 分钟 | 兼容性好，导入快 | 文件大 |
| .tar.gz 压缩 | 150-250 MB | 2-3 分钟 | 文件小，传输快 | 需要解压 |
| Docker Hub | - | 按需下载 | 方便更新 | 需要网络 |

## ☁️ 替代方案：使用 Docker Hub

如果文件太大，可以考虑推送到 Docker Hub：

```bash
# 1. 登录 Docker Hub
docker login

# 2. 标记镜像
docker tag ai-travel-planner:latest yourusername/ai-travel-planner:latest

# 3. 推送镜像
docker push yourusername/ai-travel-planner:latest

# 用户可以直接拉取
docker pull yourusername/ai-travel-planner:latest
docker run -d --name ai-travel-planner -p 3000:80 yourusername/ai-travel-planner:latest
```

## 🔐 安全检查

在分发前进行安全检查：

```bash
# 扫描镜像漏洞
docker scan ai-travel-planner:latest

# 检查镜像层
docker history ai-travel-planner:latest

# 确保没有敏感信息
docker inspect ai-travel-planner:latest
```

## ✅ 最终检查清单

构建和导出完成后，请确认：

- [ ] 镜像构建成功无错误
- [ ] 镜像可以正常运行
- [ ] 导出的 .tar 文件完整
- [ ] 文件大小合理（<600MB）
- [ ] 提供了完整的部署文档
- [ ] 包含运行脚本
- [ ] 环境变量示例清晰
- [ ] 测试过导入和运行流程
- [ ] 没有包含敏感信息

---

**构建完成后，您就可以分享镜像文件和部署文档给用户了！** 🎉
