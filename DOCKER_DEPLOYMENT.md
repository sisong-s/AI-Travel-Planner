# Docker 镜像部署指南

本文档详细说明如何使用 Docker 镜像文件部署 AI 旅行规划师应用。

## 📋 目录

- [前置要求](#前置要求)
- [Docker Desktop 安装](#docker-desktop-安装)
- [部署步骤](#部署步骤)
- [访问应用](#访问应用)
- [配置说明](#配置说明)
- [常见问题](#常见问题)
- [高级操作](#高级操作)

---

## 前置要求

### 系统要求

- **Windows**: Windows 10 64位 专业版/企业版/教育版 (Build 19041或更高) 或 Windows 11
- **Mac**: macOS 10.15 或更高版本
- **Linux**: 64位发行版，内核版本 3.10 或更高

### 硬件要求

- **CPU**: 2核或更多
- **内存**: 至少 4GB RAM (推荐 8GB)
- **磁盘**: 至少 10GB 可用空间
- **网络**: 稳定的互联网连接（首次安装需要）

---

## Docker Desktop 安装

### Windows 系统

1. **下载 Docker Desktop**
   - 访问官网: https://www.docker.com/products/docker-desktop/
   - 点击 "Download for Windows"
   - 或直接下载: https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe

2. **安装步骤**
   ```
   1. 双击下载的 Docker Desktop Installer.exe
   2. 确保勾选 "Use WSL 2 instead of Hyper-V" (推荐)
   3. 点击 "Ok" 开始安装
   4. 等待安装完成（约 5-10 分钟）
   5. 点击 "Close and restart" 重启计算机
   ```

3. **启动 Docker Desktop**
   ```
   1. 重启后，从开始菜单启动 Docker Desktop
   2. 首次启动需要接受服务条款
   3. 可以跳过登录（点击 Skip）
   4. 等待 Docker Engine 启动（右下角图标变绿）
   ```

4. **验证安装**
   ```powershell
   # 打开 PowerShell 或命令提示符，运行：
   docker --version
   docker run hello-world
   ```
   
   如果看到版本号和 "Hello from Docker!" 消息，说明安装成功。

### Mac 系统

1. **下载 Docker Desktop**
   - Intel 芯片: https://desktop.docker.com/mac/main/amd64/Docker.dmg
   - Apple 芯片 (M1/M2/M3): https://desktop.docker.com/mac/main/arm64/Docker.dmg

2. **安装步骤**
   ```
   1. 双击 Docker.dmg 文件
   2. 将 Docker 图标拖到 Applications 文件夹
   3. 从 Applications 启动 Docker
   4. 根据提示授予必要的系统权限
   5. 等待 Docker 启动完成
   ```

3. **验证安装**
   ```bash
   docker --version
   docker run hello-world
   ```

### Linux 系统

Linux 用户可以直接安装 Docker Engine，参考官方文档：
https://docs.docker.com/engine/install/

---

## 部署步骤

### 方式一：使用预构建的镜像文件（推荐）

#### 1. 准备文件

确保您有以下文件：
```
ai-travel-planner/
├── ai-travel-planner-docker-image.tar    # Docker 镜像文件（约 200-500MB）
├── DOCKER_DEPLOYMENT.md                   # 本文档
├── .env.example                           # 环境变量示例（可选）
└── docker-run.bat (Windows) 或 docker-run.sh (Mac/Linux)  # 运行脚本
```

#### 2. 导入 Docker 镜像

**Windows (PowerShell/CMD):**
```powershell
# 进入文件所在目录
cd "路径\到\ai-travel-planner"

# 导入镜像（需要 5-10 分钟，取决于文件大小）
docker load -i ai-travel-planner-docker-image.tar

# 查看已导入的镜像
docker images
```

**Mac/Linux (Terminal):**
```bash
# 进入文件所在目录
cd /path/to/ai-travel-planner

# 导入镜像
docker load -i ai-travel-planner-docker-image.tar

# 查看已导入的镜像
docker images
```

导入成功后，您会看到：
```
REPOSITORY              TAG       IMAGE ID       CREATED        SIZE
ai-travel-planner       latest    xxxxxxxxxxxx   X hours ago    XXX MB
```

#### 3. 运行容器

**方式 A: 使用脚本运行（最简单）**

**Windows:**
双击 `docker-run.bat` 文件，或在 PowerShell 中运行：
```powershell
.\docker-run.bat
```

**Mac/Linux:**
```bash
chmod +x docker-run.sh
./docker-run.sh
```

**方式 B: 手动运行命令**

```bash
# 基础运行命令（推荐）
docker run -d \
  --name ai-travel-planner \
  -p 3000:80 \
  --restart unless-stopped \
  ai-travel-planner:latest

# 如果需要使用环境变量文件
docker run -d \
  --name ai-travel-planner \
  -p 3000:80 \
  --env-file .env \
  --restart unless-stopped \
  ai-travel-planner:latest
```

**参数说明:**
- `-d`: 后台运行
- `--name ai-travel-planner`: 容器名称
- `-p 3000:80`: 端口映射（主机端口3000 -> 容器端口80）
- `--restart unless-stopped`: 自动重启策略
- `--env-file .env`: 加载环境变量文件（可选）

#### 4. 验证运行状态

```bash
# 查看运行中的容器
docker ps

# 查看容器日志
docker logs ai-travel-planner

# 实时查看日志
docker logs -f ai-travel-planner
```

正常运行时，您会看到类似输出：
```
CONTAINER ID   IMAGE                       COMMAND                  STATUS         PORTS
xxxxxxxxxxxx   ai-travel-planner:latest   "nginx -g 'daemon of…"   Up 2 minutes   0.0.0.0:3000->80/tcp
```

---

## 访问应用

### 本地访问

1. 等待容器完全启动（约 10-30 秒）
2. 打开浏览器访问: **http://localhost:3000**
3. 首次访问可能需要等待几秒加载

### 局域网访问

其他设备可以通过您的 IP 地址访问：
```
http://您的电脑IP:3000
```

查找您的 IP 地址：
- **Windows**: 运行 `ipconfig`，查看 IPv4 地址
- **Mac/Linux**: 运行 `ifconfig` 或 `ip addr`

**注意**: 需要确保防火墙允许 3000 端口的访问。

---

## 配置说明

### API 密钥配置

应用运行后，需要配置以下 API 密钥才能使用完整功能：

1. **访问设置页面**
   - 打开应用: http://localhost:3000
   - 点击右上角用户菜单 -> "设置"

2. **必需配置**

   **阿里云通义千问 API** (核心功能)
   - 获取地址: https://dashscope.aliyun.com/
   - 用途: AI 旅行计划生成
   - 配置项: `REACT_APP_ALICLOUD_API_KEY`

   **Supabase 数据库** (已预配置)
   - 默认配置已包含在镜像中
   - 如需使用自己的数据库，请在设置中修改

3. **可选配置**

   **科大讯飞语音 API**
   - 获取地址: https://www.xfyun.cn/
   - 用途: 语音输入功能
   - 配置项: `REACT_APP_XUNFEI_API_KEY`

   **高德地图 API**
   - 获取地址: https://lbs.amap.com/
   - 用途: 地图显示和导航
   - 配置项: `REACT_APP_AMAP_API_KEY`

### 环境变量配置（可选）

如果需要在容器启动时预设环境变量，可以创建 `.env` 文件：

```bash
# 创建 .env 文件
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
REACT_APP_ALICLOUD_API_KEY=your-alicloud-api-key
REACT_APP_XUNFEI_API_KEY=your-xunfei-api-key
REACT_APP_AMAP_API_KEY=your-amap-api-key
```

然后使用 `--env-file .env` 参数启动容器。

---

## 常见问题

### Q1: Docker Desktop 启动失败

**症状**: 提示 "Docker Desktop starting..." 一直卡住

**解决方案**:
```powershell
# Windows - 重启 Docker 服务
1. 完全退出 Docker Desktop
2. 打开任务管理器，结束所有 Docker 相关进程
3. 以管理员身份运行 PowerShell:
   net stop com.docker.service
   net start com.docker.service
4. 重新启动 Docker Desktop

# 或者重置 Docker Desktop
设置 -> Troubleshoot -> Reset to factory defaults
```

### Q2: 端口 3000 已被占用

**症状**: 错误信息 "port is already allocated"

**解决方案**:
```bash
# 方式1: 使用其他端口
docker run -d --name ai-travel-planner -p 8080:80 ai-travel-planner:latest
# 然后访问 http://localhost:8080

# 方式2: 停止占用 3000 端口的程序
# Windows:
netstat -ano | findstr :3000
taskkill /PID <进程ID> /F

# Mac/Linux:
lsof -i :3000
kill -9 <进程ID>
```

### Q3: 导入镜像文件失败

**症状**: "open ... no such file or directory" 或 "invalid tar header"

**解决方案**:
```bash
# 1. 确认文件完整性（检查文件大小）
# 2. 确认文件路径正确
# 3. 尝试使用完整路径
docker load -i "C:\完整\路径\ai-travel-planner-docker-image.tar"

# 4. 如果是从网络下载，确保下载完整
# 5. 重新下载或重新生成镜像文件
```

### Q4: 容器运行但无法访问

**症状**: 浏览器显示 "无法访问此网站"

**检查清单**:
```bash
# 1. 确认容器正在运行
docker ps | grep ai-travel-planner

# 2. 查看容器日志
docker logs ai-travel-planner

# 3. 检查端口映射
docker port ai-travel-planner

# 4. 尝试直接访问容器
docker exec -it ai-travel-planner wget -O- http://localhost:80

# 5. 检查防火墙设置
# Windows: 控制面板 -> Windows Defender 防火墙 -> 允许应用
# 添加 Docker Desktop 到允许列表

# 6. 重启容器
docker restart ai-travel-planner
```

### Q5: 应用加载缓慢或白屏

**可能原因**:
1. 容器刚启动，nginx 还在初始化
2. 浏览器缓存问题
3. 静态资源加载失败

**解决方案**:
```bash
# 1. 等待 30 秒后重试
# 2. 清除浏览器缓存（Ctrl+Shift+Delete）
# 3. 使用无痕模式测试
# 4. 检查容器日志
docker logs ai-travel-planner

# 5. 进入容器检查文件
docker exec -it ai-travel-planner ls -la /usr/share/nginx/html
```

### Q6: API 功能不工作

**症状**: 无法生成旅行计划、语音输入失败等

**解决方案**:
1. 打开浏览器开发者工具（F12）查看错误信息
2. 确认在应用设置中配置了正确的 API 密钥
3. 检查 API 密钥是否有效且有足够配额
4. 确认网络连接正常

### Q7: 内存不足

**症状**: Docker Desktop 提示内存不足

**解决方案**:
```bash
# 清理不使用的镜像和容器
docker system prune -a

# 调整 Docker Desktop 内存限制
Docker Desktop -> Settings -> Resources -> Memory
# 建议设置为至少 4GB
```

---

## 高级操作

### 容器管理命令

```bash
# 停止容器
docker stop ai-travel-planner

# 启动已停止的容器
docker start ai-travel-planner

# 重启容器
docker restart ai-travel-planner

# 删除容器（需先停止）
docker stop ai-travel-planner
docker rm ai-travel-planner

# 删除镜像（需先删除容器）
docker rmi ai-travel-planner:latest

# 查看容器资源使用情况
docker stats ai-travel-planner

# 进入容器内部（调试用）
docker exec -it ai-travel-planner sh
```

### 日志管理

```bash
# 查看最后 100 行日志
docker logs --tail 100 ai-travel-planner

# 实时查看日志
docker logs -f ai-travel-planner

# 查看带时间戳的日志
docker logs -t ai-travel-planner

# 保存日志到文件
docker logs ai-travel-planner > app.log 2>&1
```

### 数据备份

```bash
# 备份容器配置和数据
docker commit ai-travel-planner ai-travel-planner:backup

# 导出备份镜像
docker save ai-travel-planner:backup -o backup.tar

# 恢复备份
docker load -i backup.tar
```

### 更新应用

```bash
# 1. 停止并删除旧容器
docker stop ai-travel-planner
docker rm ai-travel-planner

# 2. 删除旧镜像
docker rmi ai-travel-planner:latest

# 3. 导入新镜像
docker load -i ai-travel-planner-docker-image-new.tar

# 4. 重新运行容器
docker run -d --name ai-travel-planner -p 3000:80 --restart unless-stopped ai-travel-planner:latest
```

### 修改端口映射

```bash
# 必须重新创建容器才能修改端口
docker stop ai-travel-planner
docker rm ai-travel-planner

# 使用新端口启动
docker run -d --name ai-travel-planner -p 8080:80 --restart unless-stopped ai-travel-planner:latest
```

### 设置开机自启动

```bash
# 容器已设置 --restart unless-stopped
# Docker Desktop 需要设置为开机启动

# Windows: 
# Docker Desktop -> Settings -> General -> Start Docker Desktop when you log in

# Linux:
sudo systemctl enable docker
```

---

## 性能优化建议

### 1. 资源限制

```bash
# 限制容器资源使用
docker run -d \
  --name ai-travel-planner \
  -p 3000:80 \
  --memory="512m" \
  --cpus="1.0" \
  --restart unless-stopped \
  ai-travel-planner:latest
```

### 2. Docker Desktop 设置

```
Settings -> Resources:
- CPUs: 2
- Memory: 4GB
- Swap: 1GB
- Disk image size: 根据需要调整
```

### 3. 网络优化

```bash
# 使用 host 网络模式（仅 Linux）
docker run -d --name ai-travel-planner --network host ai-travel-planner:latest
```

---

## 安全建议

1. **定期更新**
   - 定期更新 Docker Desktop
   - 定期更新应用镜像

2. **网络安全**
   - 不要将容器直接暴露到公网
   - 使用反向代理（如 Nginx、Caddy）
   - 配置 HTTPS（生产环境）

3. **API 密钥管理**
   - 不要在代码中硬编码密钥
   - 使用环境变量或应用内设置
   - 定期轮换密钥

4. **防火墙配置**
   - 仅开放必要的端口
   - 限制访问来源 IP

---

## 技术支持

### 获取帮助

1. **查看日志**
   ```bash
   docker logs ai-travel-planner
   ```

2. **检查容器状态**
   ```bash
   docker inspect ai-travel-planner
   ```

3. **浏览器开发者工具**
   - 按 F12 打开开发者工具
   - 查看 Console 和 Network 标签

### 常用诊断命令

```bash
# 完整的健康检查
docker ps -a
docker logs ai-travel-planner
docker inspect ai-travel-planner
docker stats ai-travel-planner --no-stream

# 网络诊断
docker network ls
docker network inspect bridge

# 系统信息
docker info
docker version
```

---

## 卸载指南

### 完全卸载应用

```bash
# 1. 停止并删除容器
docker stop ai-travel-planner
docker rm ai-travel-planner

# 2. 删除镜像
docker rmi ai-travel-planner:latest

# 3. 清理系统（可选）
docker system prune -a --volumes
```

### 卸载 Docker Desktop

**Windows:**
1. 设置 -> 应用 -> Docker Desktop -> 卸载
2. 删除 `%APPDATA%\Docker` 文件夹

**Mac:**
1. 应用程序文件夹 -> 删除 Docker.app
2. 清理配置文件:
   ```bash
   rm -rf ~/Library/Group\ Containers/group.com.docker
   rm -rf ~/Library/Containers/com.docker.*
   ```

---

## 附录

### A. 快速命令参考

```bash
# 导入镜像
docker load -i ai-travel-planner-docker-image.tar

# 运行容器
docker run -d --name ai-travel-planner -p 3000:80 --restart unless-stopped ai-travel-planner:latest

# 查看状态
docker ps

# 查看日志
docker logs ai-travel-planner

# 停止容器
docker stop ai-travel-planner

# 启动容器
docker start ai-travel-planner

# 重启容器
docker restart ai-travel-planner

# 删除容器
docker rm ai-travel-planner

# 删除镜像
docker rmi ai-travel-planner:latest
```

### B. 浏览器兼容性

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 11+
- ✅ Edge 79+

### C. 系统要求总结

| 组件 | 最低要求 | 推荐配置 |
|------|----------|----------|
| CPU | 2核 | 4核+ |
| 内存 | 4GB | 8GB+ |
| 磁盘 | 10GB | 20GB+ |
| 操作系统 | Win10/macOS 10.15 | Win11/macOS 12+ |

---

**祝您使用愉快！** 🚀

如有问题，请检查日志并参考常见问题部分。
