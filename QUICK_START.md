# 🚀 快速启动指南

## 一键启动（推荐）

### Windows用户
1. 确保已安装 [Docker Desktop](https://www.docker.com/products/docker-desktop/)
2. 双击运行 `scripts/start.bat`
3. 等待构建完成，浏览器会自动打开应用

### Linux/Mac用户
1. 确保已安装 Docker
2. 在终端中运行：
```bash
chmod +x scripts/start.sh
./scripts/start.sh
```
3. 访问 http://localhost:3000

## 手动启动

### 使用Docker
```bash
# 构建镜像
docker build -t ai-travel-planner .

# 运行容器
docker run -d -p 3000:80 --name ai-travel-planner ai-travel-planner

# 访问应用
# 打开浏览器访问 http://localhost:3000
```

### 使用Docker Compose
```bash
docker-compose up -d
```

## 首次使用配置

1. **注册账号**：首次访问需要注册用户账号
2. **配置API密钥**：
   - 点击右上角头像 → 设置
   - 按照页面指引配置各项API密钥
   - 至少需要配置阿里云API密钥才能使用AI功能

## 必需的API服务

| 服务 | 用途 | 是否必需 | 获取地址 |
|------|------|----------|----------|
| 阿里云通义千问 | AI旅行计划生成 | ✅ 必需 | https://dashscope.aliyun.com/ |
| Supabase | 数据存储和认证 | ✅ 必需 | https://supabase.com/ |
| 科大讯飞语音 | 语音输入功能 | ⭕ 可选 | https://www.xfyun.cn/ |
| 高德地图 | 地图显示 | ⭕ 可选 | https://lbs.amap.com/ |

## 停止应用

```bash
# 停止容器
docker stop ai-travel-planner

# 删除容器
docker rm ai-travel-planner

# 删除镜像（可选）
docker rmi ai-travel-planner
```

## 故障排除

### 端口被占用
如果3000端口被占用，可以修改端口：
```bash
docker run -d -p 8080:80 --name ai-travel-planner ai-travel-planner
```
然后访问 http://localhost:8080

### Docker相关问题
- 确保Docker Desktop已启动
- 检查Docker版本：`docker --version`
- 查看容器状态：`docker ps -a`
- 查看容器日志：`docker logs ai-travel-planner`

### 应用功能问题
- 检查浏览器控制台是否有错误
- 确认API密钥配置正确
- 检查网络连接

## 开发模式

如需进行开发，可以使用本地模式：

```bash
# 安装依赖
npm install

# 启动开发服务器
npm start

# 访问 http://localhost:3000
```

---

**🎉 现在您可以开始使用AI旅行规划师了！**