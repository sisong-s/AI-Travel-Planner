# AI Travel Planner - Docker 镜像分发包

## 📦 分发包内容

本分发包包含以下文件：

```
ai-travel-planner-release/
├── 📄 ai-travel-planner-docker-image.tar   # Docker 镜像文件 (~400-600MB)
├── 📘 DOCKER_DEPLOYMENT.md                  # 详细部署文档（用户必读）
├── 🚀 docker-run.bat                        # Windows 一键运行脚本
├── 🚀 docker-run.sh                         # Mac/Linux 一键运行脚本
├── ⚙️ .env.example                          # 环境变量配置示例
├── 📖 README.md                             # 项目介绍
└── 📋 DISTRIBUTION_README.md                # 本文件
```

## 🎯 快速开始（用户指南）

### 第一步：安装 Docker Desktop

**必须先安装 Docker Desktop！**

- **Windows**: https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe
- **Mac (Intel)**: https://desktop.docker.com/mac/main/amd64/Docker.dmg
- **Mac (M1/M2/M3)**: https://desktop.docker.com/mac/main/arm64/Docker.dmg

安装后启动 Docker Desktop，等待图标变绿。

### 第二步：导入 Docker 镜像

**Windows (PowerShell 或 CMD):**
```cmd
# 进入文件所在目录
cd 路径\到\ai-travel-planner-release

# 导入镜像（需要 5-10 分钟）
docker load -i ai-travel-planner-docker-image.tar
```

**Mac/Linux (Terminal):**
```bash
# 进入文件所在目录
cd /path/to/ai-travel-planner-release

# 导入镜像
docker load -i ai-travel-planner-docker-image.tar
```

### 第三步：运行应用

**最简单方式 - 使用脚本:**

- **Windows**: 双击 `docker-run.bat` 文件
- **Mac/Linux**: 运行 `chmod +x docker-run.sh && ./docker-run.sh`

**或手动运行:**
```bash
docker run -d --name ai-travel-planner -p 3000:80 --restart unless-stopped ai-travel-planner:latest
```

### 第四步：访问应用

等待 30 秒后，在浏览器打开：**http://localhost:3000**

## 📚 详细文档

完整的安装和使用说明请查看 **DOCKER_DEPLOYMENT.md**，包括：
- Docker Desktop 详细安装步骤
- 常见问题解决方案
- API 密钥配置指南
- 容器管理命令
- 故障排查指南

## ⚙️ 配置要求

### 系统要求
- **Windows**: Windows 10 64位 (Build 19041+) 或 Windows 11
- **Mac**: macOS 10.15 或更高版本
- **Linux**: 64位发行版，内核 3.10+

### 硬件要求
- **CPU**: 2核或更多
- **内存**: 至少 4GB RAM
- **磁盘**: 至少 10GB 可用空间

## 🔧 API 配置

应用需要配置以下 API 才能使用完整功能：

### 必需配置
1. **阿里云通义千问 API** - AI 旅行计划生成（核心功能）
   - 获取: https://dashscope.aliyun.com/

### 可选配置
2. **科大讯飞语音 API** - 语音输入功能
   - 获取: https://www.xfyun.cn/
3. **高德地图 API** - 地图显示
   - 获取: https://lbs.amap.com/

**配置方式**: 应用运行后，点击右上角用户菜单 -> "设置" -> 填入 API 密钥

## 🆘 遇到问题？

### 常见问题快速解决

**Q: Docker Desktop 无法启动？**
```
1. 以管理员身份运行 Docker Desktop
2. 重启计算机后再试
3. 查看 DOCKER_DEPLOYMENT.md 中的详细解决方案
```

**Q: 端口 3000 被占用？**
```bash
# 使用其他端口运行
docker run -d --name ai-travel-planner -p 8080:80 ai-travel-planner:latest
# 然后访问 http://localhost:8080
```

**Q: 导入镜像失败？**
```
1. 确认文件完整下载（检查文件大小）
2. 确认 Docker Desktop 正在运行
3. 使用完整路径导入
```

**Q: 浏览器无法访问？**
```bash
# 检查容器是否运行
docker ps

# 查看容器日志
docker logs ai-travel-planner

# 等待 30 秒再访问（容器需要启动时间）
```

## 📞 获取帮助

1. **查看详细文档**: DOCKER_DEPLOYMENT.md
2. **查看容器日志**: `docker logs ai-travel-planner`
3. **浏览器控制台**: 按 F12 查看错误信息

## 🛠️ 常用命令

```bash
# 查看运行状态
docker ps

# 停止应用
docker stop ai-travel-planner

# 启动应用
docker start ai-travel-planner

# 重启应用
docker restart ai-travel-planner

# 查看日志
docker logs ai-travel-planner

# 删除应用（需先停止）
docker stop ai-travel-planner
docker rm ai-travel-planner
```

## 🌟 核心功能

- ✅ **智能行程规划**: AI 自动生成个性化旅行路线
- ✅ **语音输入**: 支持语音输入旅行需求
- ✅ **费用管理**: 智能预算分析和费用追踪
- ✅ **地图导航**: 集成高德地图显示路线
- ✅ **云端同步**: 多设备数据同步

## 📱 浏览器支持

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## 📄 许可证

本项目采用 MIT 许可证

---

## 🚀 开始使用

现在就按照上述步骤开始使用吧！如有问题，请参考 `DOCKER_DEPLOYMENT.md` 获取详细帮助。

**祝您旅途愉快！** ✈️🗺️
