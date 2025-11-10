# Docker 快速参考

## 🎯 常用命令速查

### 镜像管理
```bash
# 导入镜像
docker load -i ai-travel-planner-docker-image.tar

# 查看所有镜像
docker images

# 删除镜像
docker rmi ai-travel-planner:latest

# 构建镜像
docker build -t ai-travel-planner:latest .

# 导出镜像
docker save ai-travel-planner:latest -o ai-travel-planner-docker-image.tar
```

### 容器管理
```bash
# 运行容器（基础）
docker run -d --name ai-travel-planner -p 3000:80 ai-travel-planner:latest

# 运行容器（完整参数）
docker run -d \
  --name ai-travel-planner \
  -p 3000:80 \
  --restart unless-stopped \
  ai-travel-planner:latest

# 查看运行中的容器
docker ps

# 查看所有容器（包括停止的）
docker ps -a

# 停止容器
docker stop ai-travel-planner

# 启动已停止的容器
docker start ai-travel-planner

# 重启容器
docker restart ai-travel-planner

# 删除容器（需先停止）
docker stop ai-travel-planner
docker rm ai-travel-planner

# 强制删除运行中的容器
docker rm -f ai-travel-planner
```

### 日志和诊断
```bash
# 查看日志
docker logs ai-travel-planner

# 实时查看日志
docker logs -f ai-travel-planner

# 查看最后 100 行日志
docker logs --tail 100 ai-travel-planner

# 查看容器详细信息
docker inspect ai-travel-planner

# 查看容器资源使用
docker stats ai-travel-planner

# 进入容器内部
docker exec -it ai-travel-planner sh

# 查看容器端口映射
docker port ai-travel-planner
```

### 系统清理
```bash
# 删除停止的容器
docker container prune

# 删除未使用的镜像
docker image prune

# 删除所有未使用的资源（危险！）
docker system prune -a

# 查看 Docker 磁盘使用
docker system df
```

---

## 🔧 故障排查速查

### 问题：容器启动失败
```bash
# 1. 查看日志
docker logs ai-travel-planner

# 2. 查看容器状态
docker ps -a | grep ai-travel-planner

# 3. 重新运行
docker rm ai-travel-planner
docker run -d --name ai-travel-planner -p 3000:80 ai-travel-planner:latest
```

### 问题：端口被占用
```bash
# Windows - 查找占用端口的进程
netstat -ano | findstr :3000
taskkill /PID <进程ID> /F

# Mac/Linux - 查找占用端口的进程
lsof -i :3000
kill -9 <进程ID>

# 或使用其他端口
docker run -d --name ai-travel-planner -p 8080:80 ai-travel-planner:latest
```

### 问题：无法访问应用
```bash
# 1. 确认容器运行
docker ps | grep ai-travel-planner

# 2. 检查端口映射
docker port ai-travel-planner

# 3. 测试容器内部
docker exec -it ai-travel-planner wget -O- http://localhost:80

# 4. 重启容器
docker restart ai-travel-planner

# 5. 等待 30 秒后访问
```

### 问题：容器运行缓慢
```bash
# 1. 查看资源使用
docker stats ai-travel-planner --no-stream

# 2. 限制资源使用
docker run -d \
  --name ai-travel-planner \
  -p 3000:80 \
  --memory="512m" \
  --cpus="1.0" \
  ai-travel-planner:latest

# 3. 清理 Docker 缓存
docker system prune
```

---

## 📱 访问地址

| 环境 | 地址 |
|------|------|
| 本地访问 | http://localhost:3000 |
| 局域网访问 | http://你的IP:3000 |
| 自定义端口 | http://localhost:自定义端口 |

**查找本机 IP:**
- Windows: `ipconfig`
- Mac/Linux: `ifconfig` 或 `ip addr`

---

## ⚙️ 环境变量

### 方式1: 使用 .env 文件
```bash
# 创建 .env 文件
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-key
REACT_APP_ALICLOUD_API_KEY=your-key

# 运行时加载
docker run -d \
  --name ai-travel-planner \
  -p 3000:80 \
  --env-file .env \
  ai-travel-planner:latest
```

### 方式2: 命令行指定
```bash
docker run -d \
  --name ai-travel-planner \
  -p 3000:80 \
  -e REACT_APP_ALICLOUD_API_KEY=your-key \
  ai-travel-planner:latest
```

### 方式3: 应用内设置（推荐）
```
访问应用 -> 右上角菜单 -> 设置 -> 填写 API 密钥
```

---

## 🔄 更新流程

### 更新到新版本
```bash
# 1. 停止并删除旧容器
docker stop ai-travel-planner
docker rm ai-travel-planner

# 2. 删除旧镜像
docker rmi ai-travel-planner:latest

# 3. 导入新镜像
docker load -i ai-travel-planner-docker-image-new.tar

# 4. 运行新容器
docker run -d --name ai-travel-planner -p 3000:80 --restart unless-stopped ai-travel-planner:latest
```

### 备份当前版本
```bash
# 创建备份镜像
docker commit ai-travel-planner ai-travel-planner:backup

# 导出备份
docker save ai-travel-planner:backup -o backup-$(date +%Y%m%d).tar
```

---

## 🎨 端口配置

### 更改访问端口
```bash
# 使用 8080 端口
docker run -d --name ai-travel-planner -p 8080:80 ai-travel-planner:latest
# 访问: http://localhost:8080

# 使用 80 端口（需要管理员权限）
docker run -d --name ai-travel-planner -p 80:80 ai-travel-planner:latest
# 访问: http://localhost

# 使用自定义端口
docker run -d --name ai-travel-planner -p 自定义端口:80 ai-travel-planner:latest
```

---

## 💾 数据持久化

### 挂载本地目录（可选）
```bash
# 持久化配置数据
docker run -d \
  --name ai-travel-planner \
  -p 3000:80 \
  -v /path/to/data:/data \
  ai-travel-planner:latest
```

**注意**: 当前镜像数据存储在 Supabase 云端，无需本地持久化。

---

## 🔐 安全建议

### 生产环境配置
```bash
# 1. 使用环境变量而非硬编码
--env-file .env

# 2. 限制资源使用
--memory="512m" --cpus="1.0"

# 3. 设置重启策略
--restart unless-stopped

# 4. 使用只读根文件系统（可选）
--read-only

# 5. 不要暴露到公网
# 使用反向代理（Nginx/Caddy）
```

---

## 📊 性能优化

### 资源限制
```bash
docker run -d \
  --name ai-travel-planner \
  -p 3000:80 \
  --memory="512m" \
  --memory-swap="1g" \
  --cpus="2.0" \
  --restart unless-stopped \
  ai-travel-planner:latest
```

### Docker Desktop 设置
```
Settings -> Resources:
- CPUs: 2-4
- Memory: 4GB
- Swap: 1GB
- Disk: 60GB
```

---

## 🆘 紧急救援

### 一键重置（删除所有相关资源）
```bash
# ⚠️ 警告：这会删除容器和镜像
docker stop ai-travel-planner
docker rm ai-travel-planner
docker rmi ai-travel-planner:latest

# 重新开始
docker load -i ai-travel-planner-docker-image.tar
docker run -d --name ai-travel-planner -p 3000:80 ai-travel-planner:latest
```

### 完全清理 Docker
```bash
# ⚠️ 危险：删除所有 Docker 数据
docker system prune -a --volumes
```

---

## 📞 快速帮助

| 需要帮助 | 查看 |
|----------|------|
| 详细安装步骤 | DOCKER_DEPLOYMENT.md |
| 构建镜像 | BUILD_AND_EXPORT.md |
| 快速开始 | START_HERE.md |
| 项目介绍 | README.md |
| 常见问题 | DOCKER_DEPLOYMENT.md (FAQ 部分) |

---

## 🔗 有用链接

- Docker Desktop 下载: https://www.docker.com/products/docker-desktop/
- Docker 官方文档: https://docs.docker.com/
- Docker Hub: https://hub.docker.com/
- 阿里云通义千问: https://dashscope.aliyun.com/
- Supabase: https://supabase.com/

---

**将此页面加入书签以便快速查阅！** 🔖
