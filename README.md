# AI旅行规划师 (AI Travel Planner)

一个基于React的智能旅行规划Web应用，通过AI技术帮助用户生成个性化的旅行计划，并提供费用管理和实时旅行辅助功能。

## 🌟 核心功能

### 1. 智能行程规划
- **语音输入支持**：用户可通过语音或文字输入旅行需求
- **AI生成计划**：基于阿里云通义千问API自动生成详细旅行路线
- **个性化推荐**：根据目的地、预算、偏好等生成定制化行程
- **详细信息**：包含交通、住宿、景点、餐厅等完整信息

### 2. 费用预算与管理
- **智能预算分析**：AI辅助进行预算规划和分析
- **语音记账**：支持语音输入费用记录
- **分类统计**：按住宿、交通、餐饮等类别统计支出
- **可视化图表**：提供饼图和柱状图展示费用分布

### 3. 用户管理与数据存储
- **注册登录系统**：基于Supabase的用户认证
- **云端同步**：旅行计划、偏好设置、费用记录云端存储
- **多设备访问**：支持跨设备查看和修改数据

### 4. 地图导航
- **高德地图集成**：显示目的地位置和周边信息
- **路径规划**：提供多种交通方式的路线规划
- **位置标记**：在地图上标记重要景点和住宿

## 🛠 技术栈

- **前端框架**：React 18 + React Router
- **UI组件库**：Ant Design
- **语音识别**：科大讯飞 Web Speech API
- **地图服务**：高德地图 JavaScript API
- **AI服务**：阿里云通义千问API
- **数据库/认证**：Supabase
- **图表库**：Recharts
- **构建工具**：Create React App
- **容器化**：Docker + Nginx

## 🚀 快速开始

### 方式一：Docker运行（推荐）

1. **下载项目**
```bash
git clone <repository-url>
cd AI-Travel-Planner
```

2. **构建Docker镜像**
```bash
docker build -t ai-travel-planner .
```

3. **运行容器**
```bash
docker run -p 3000:80 ai-travel-planner
```

或使用docker-compose：
```bash
docker-compose up -d
```

4. **访问应用**
打开浏览器访问 `http://localhost:3000`

### 方式二：本地开发

1. **安装依赖**
```bash
npm install
```

2. **启动开发服务器**
```bash
npm start
```

3. **构建生产版本**
```bash
npm run build
```

## ⚙️ 配置说明

应用需要配置以下API密钥才能正常使用所有功能：

### 必需配置

1. **阿里云通义千问API**
   - 用途：AI旅行计划生成（核心功能）
   - 获取：https://dashscope.aliyun.com/

2. **Supabase数据库**
   - 用途：数据存储和用户认证
   - 获取：https://supabase.com/

### 可选配置

3. **科大讯飞语音API**
   - 用途：语音输入功能
   - 获取：https://www.xfyun.cn/

4. **高德地图API**
   - 用途：地图显示和位置服务
   - 获取：https://lbs.amap.com/

### 配置方法

1. 启动应用后，点击右上角用户菜单中的"设置"
2. 在设置页面填入相应的API密钥
3. 配置信息会安全地存储在浏览器本地存储中

## 📊 数据库结构

应用使用Supabase PostgreSQL数据库，主要表结构：

- `travel_plans`：旅行计划表
- `expenses`：费用记录表  
- `user_preferences`：用户偏好表

数据库初始化脚本位于 `database/init.sql`

## 🔒 安全特性

- **本地存储**：API密钥仅存储在浏览器本地，不上传服务器
- **行级安全**：数据库启用RLS，确保用户只能访问自己的数据
- **HTTPS支持**：生产环境建议使用HTTPS
- **输入验证**：前端表单验证和后端数据校验

## 🌐 浏览器支持

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

注：语音功能需要浏览器支持Web Speech API

## 📱 响应式设计

应用采用响应式设计，支持：
- 桌面端（1200px+）
- 平板端（768px-1199px）
- 移动端（<768px）

## 🔧 开发指南

### 项目结构
```
src/
├── components/          # React组件
│   ├── Auth/           # 认证相关组件
│   ├── Dashboard/      # 仪表板组件
│   ├── TravelPlanner/  # 旅行规划组件
│   ├── ExpenseTracker/ # 费用管理组件
│   ├── Settings/       # 设置组件
│   ├── Layout/         # 布局组件
│   └── Common/         # 通用组件
├── contexts/           # React Context
├── services/           # API服务层
└── utils/             # 工具函数
```

### 环境变量
```bash
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 构建命令
```bash
npm run build      # 生产构建
npm run test       # 运行测试
npm run eject      # 弹出配置（不可逆）
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🆘 常见问题

### Q: 语音功能不工作？
A: 请确保：
1. 浏览器支持Web Speech API
2. 已配置科大讯飞API密钥
3. 允许浏览器访问麦克风权限

### Q: 地图不显示？
A: 请检查：
1. 是否配置了高德地图API密钥
2. API密钥是否有效且有足够配额
3. 网络连接是否正常

### Q: AI生成计划失败？
A: 请确认：
1. 阿里云API密钥配置正确
2. API账户有足够余额
3. 输入的旅行信息完整

### Q: 数据无法保存？
A: 请检查：
1. Supabase配置是否正确
2. 数据库表是否已创建
3. 网络连接是否稳定

## 📞 技术支持

如遇到问题，请：
1. 查看浏览器控制台错误信息
2. 检查API配置是否正确
3. 确认网络连接正常
4. 提交Issue描述具体问题

---

**享受您的智能旅行规划体验！** ✈️🗺️