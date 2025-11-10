# 开始使用 - Docker 镜像分发方案

## 🎯 您想做什么？

### 选项 A: 我是项目维护者，想要构建和分发镜像

👉 **请查看**: `如何构建和分发Docker镜像.md`

**快速步骤**:
1. 安装 Docker Desktop
2. 运行 `build-and-export.bat` (Windows) 或 `build-and-export.sh` (Mac/Linux)
3. 等待生成 `ai-travel-planner-docker-image.tar` 文件
4. 将文件和文档打包分享给用户

---

### 选项 B: 我是用户，收到了镜像文件，想要运行

👉 **请查看**: `DOCKER_DEPLOYMENT.md`

**快速步骤**:
1. 安装 Docker Desktop (https://www.docker.com/products/docker-desktop/)
2. 导入镜像: `docker load -i ai-travel-planner-docker-image.tar`
3. 运行脚本: 双击 `docker-run.bat` (Windows) 或运行 `docker-run.sh` (Mac/Linux)
4. 访问: http://localhost:3000

---

## 📁 文件说明

| 文件名 | 用途 | 阅读对象 |
|--------|------|----------|
| **START_HERE.md** | 本文件 - 快速导航 | 所有人 |
| **如何构建和分发Docker镜像.md** | 构建和分发指南 | 项目维护者 |
| **DOCKER_DEPLOYMENT.md** | 详细部署指南 | 最终用户 ⭐ |
| **DISTRIBUTION_README.md** | 快速开始指南 | 最终用户 |
| **BUILD_AND_EXPORT.md** | 详细构建说明 | 项目维护者 |
| `build-and-export.bat/sh` | 自动构建脚本 | 项目维护者 |
| `docker-run.bat/sh` | 自动运行脚本 | 最终用户 |
| `.env.example` | 环境变量示例 | 所有人 |

---

## ⚡ 一分钟快速了解

### 这个项目是什么？
AI Travel Planner（AI旅行规划师）- 基于 React 的智能旅行规划 Web 应用

### Docker 镜像是什么？
一个包含完整应用和运行环境的打包文件，用户无需安装 Node.js、npm 等，只需 Docker Desktop 即可运行

### 我需要什么？
- **Windows 10/11** 或 **Mac** 或 **Linux**
- **至少 4GB 内存**
- **Docker Desktop**（免费下载）
- **稳定的网络连接**（首次安装 Docker Desktop）

### 需要多长时间？
- 安装 Docker Desktop: 10-15 分钟
- 导入镜像: 5-10 分钟
- 运行应用: 30 秒
- **总计**: 约 20-30 分钟

---

## 🚀 我该做什么？

### 如果您是项目维护者（构建镜像）

```bash
# 1. 确保安装了 Docker Desktop

# 2. Windows 用户
双击运行: build-and-export.bat

# 或 Mac/Linux 用户
chmod +x build-and-export.sh
./build-and-export.sh

# 3. 等待完成，会生成:
#    ai-travel-planner-docker-image.tar (约 500MB)

# 4. 将以下文件打包分享:
#    - ai-travel-planner-docker-image.tar
#    - DOCKER_DEPLOYMENT.md
#    - docker-run.bat 和 docker-run.sh
#    - DISTRIBUTION_README.md
```

**详细说明**: 查看 `如何构建和分发Docker镜像.md`

---

### 如果您是最终用户（运行镜像）

```bash
# 1. 下载并安装 Docker Desktop
#    https://www.docker.com/products/docker-desktop/

# 2. 启动 Docker Desktop（等待图标变绿）

# 3. 导入镜像
cd 文件所在目录
docker load -i ai-travel-planner-docker-image.tar

# 4. 运行应用
# Windows: 双击 docker-run.bat
# Mac/Linux: ./docker-run.sh

# 5. 打开浏览器访问
http://localhost:3000
```

**详细说明**: 查看 `DOCKER_DEPLOYMENT.md`

---

## ❓ 常见问题

### Q: 必须安装 Docker Desktop 吗？
**A**: 是的，这是运行 Docker 镜像的必需软件。

### Q: Docker Desktop 免费吗？
**A**: 对于个人使用和小型企业，Docker Desktop 是免费的。

### Q: 我的电脑配置够吗？
**A**: 需要至少 4GB 内存，推荐 8GB。Windows 10 64位或更高版本。

### Q: 文件太大怎么办？
**A**: 镜像文件约 500MB，可以通过网盘分享。也可以使用 Docker Hub 在线方式（见文档）。

### Q: 如何配置 API 密钥？
**A**: 应用运行后，点击右上角设置，在设置页面填入 API 密钥。

### Q: 遇到错误怎么办？
**A**: 查看 `DOCKER_DEPLOYMENT.md` 中的"常见问题"部分，或运行 `docker logs ai-travel-planner` 查看日志。

---

## 📞 获取帮助

1. **查看文档** (最快):
   - 用户: `DOCKER_DEPLOYMENT.md`
   - 维护者: `如何构建和分发Docker镜像.md`

2. **查看日志**:
   ```bash
   docker logs ai-travel-planner
   ```

3. **浏览器控制台**:
   - 按 F12 查看错误信息

---

## 🎯 下一步

### 项目维护者 → 阅读
📖 `如何构建和分发Docker镜像.md`

### 最终用户 → 阅读  
📖 `DOCKER_DEPLOYMENT.md` ⭐ 最重要

---

**开始您的 Docker 之旅！** 🚀
