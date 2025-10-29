# AI 旅行规划师

一个基于 React + TypeScript + Ant Design 的智能旅行规划前端应用，通过多模态多agent协作帮助用户规划完美旅程。

## 🚀 功能特性

### 核心功能
- **智能行程规划**: 支持语音/文字输入旅行需求，AI自动生成个性化旅行路线
- **费用预算管理**: 智能预算分析，支持语音记录旅行开销
- **用户管理**: 完整的注册登录系统，云端数据同步
- **多模态交互**: 集成语音识别，支持语音输入和控制

### 技术特性
- **现代化技术栈**: React 18 + TypeScript + Ant Design 5
- **状态管理**: Redux Toolkit 进行全局状态管理
- **响应式设计**: 适配各种设备屏幕
- **组件化开发**: 高度模块化的组件架构

## 🛠️ 技术栈

- **前端框架**: React 18 + TypeScript
- **UI 组件库**: Ant Design 5
- **状态管理**: Redux Toolkit + React Redux
- **路由管理**: React Router DOM 6
- **日期处理**: Day.js
- **语音识别**: Web Speech API (浏览器原生)

## 📦 项目结构

```
src/
├── components/          # 公共组件
│   ├── Layout/         # 布局组件
│   └── VoiceInput/     # 语音输入组件
├── pages/              # 页面组件
│   ├── Login.tsx       # 登录页面
│   ├── Dashboard.tsx   # 仪表盘
│   ├── PlanCreation.tsx # 创建行程
│   ├── PlanDetail.tsx  # 行程详情
│   ├── ExpenseManagement.tsx # 费用管理
│   └── Profile.tsx     # 个人中心
├── store/              # Redux 状态管理
│   ├── slices/         # Redux slices
│   └── index.ts        # Store 配置
├── types/              # TypeScript 类型定义
└── App.tsx             # 主应用组件
```

## 🚀 快速开始

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm start
```

应用将在 http://localhost:3000 启动

### 构建生产版本
```bash
npm run build
```

## 📱 功能模块

### 1. 用户认证
- 用户注册/登录
- 个人信息管理
- 偏好设置

### 2. 智能行程规划
- 语音/文字输入旅行需求
- AI 生成个性化行程
- 地图展示和路线规划
- 景点、餐厅、住宿推荐

### 3. 费用管理
- 支出记录和分类
- 预算分析和提醒
- 语音记录费用
- 费用统计和可视化

### 4. 数据同步
- 云端数据存储
- 多设备同步
- 离线数据缓存

## 🔧 开发说明

### Redux 状态管理
项目使用 Redux Toolkit 进行状态管理，包含以下 slices：
- `authSlice`: 用户认证状态
- `travelPlanSlice`: 旅行计划数据
- `expenseSlice`: 费用记录数据
- `voiceSlice`: 语音输入状态

### 组件设计原则
- 单一职责原则
- 可复用性
- TypeScript 类型安全
- Ant Design 设计规范

### 语音功能
使用浏览器原生 Web Speech API 实现语音识别功能，支持：
- 中文语音识别
- 实时转录
- 语音命令解析

## 📋 TODO 清单

### 后端集成 (优先级: 高)
- [ ] 集成用户认证 API (Firebase/Supabase)
- [ ] 集成大语言模型 API 进行行程规划
- [ ] 集成地图 API (高德/百度地图)
- [ ] 集成语音识别 API (科大讯飞)
- [ ] 实现云端数据存储和同步

### 功能增强 (优先级: 中)
- [ ] 添加实时天气信息
- [ ] 实现离线地图下载
- [ ] 添加分享功能
- [ ] 集成支付功能
- [ ] 实现多语言支持

### 性能优化 (优先级: 中)
- [ ] 代码分割和懒加载
- [ ] 图片优化和 CDN
- [ ] 缓存策略优化
- [ ] PWA 支持

### 用户体验 (优先级: 低)
- [ ] 添加动画效果
- [ ] 深色模式支持
- [ ] 无障碍功能优化
- [ ] 移动端适配优化

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系方式

如有问题或建议，请通过以下方式联系：
- 邮箱: your-email@example.com
- GitHub Issues: [项目 Issues](https://github.com/your-username/ai-travel-planner/issues)

---

**注意**: 当前版本为前端原型，使用 Redux 模拟后端数据。生产环境需要集成真实的后端服务和第三方 API。