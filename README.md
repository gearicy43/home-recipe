# 家庭菜谱助手

基于对话的智能家庭菜谱推荐 Web 应用。

## 功能特性

- 自然语言对话推荐菜谱
- 根据手头食材推荐可做菜品
- 动态调整菜谱（替代食材、简化步骤等）
- 快捷标签筛选（地域、口味、烹饪时间）
- 热量估算
- 暗色/亮色主题
- 移动端适配

## 技术栈

- React 18 + TypeScript
- Vite 5
- TanStack Router
- Jotai
- Express + Claude API

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 API Key

首次使用时，点击输入框左侧的设置按钮，输入你的 Anthropic API Key。
API Key 仅保存在本地浏览器中。

获取 API Key: https://console.anthropic.com/

### 3. 启动开发服务器

需要同时启动前端和后端：

终端 1 - 启动后端 API:
```bash
npx tsx server/index.ts
```

终端 2 - 启动前端:
```bash
npm run dev
```

然后访问 http://localhost:3000

### 4. 使用

- 直接输入想吃的菜名，如"西红柿炒鸡蛋"
- 输入手头食材，如"我有土豆、鸡蛋"
- 使用快捷标签快速筛选（川菜、清淡、快手菜等）
- 在对话中继续调整需求

## 项目结构

```
home-recipe/
├── src/                    # 前端代码
│   ├── components/         # React 组件
│   │   ├── chat/          # 聊天相关组件
│   │   ├── recipe/        # 菜谱卡片组件
│   │   └── common/        # 通用组件
│   ├── hooks/             # 自定义 Hooks
│   ├── routes/            # 页面路由
│   ├── main.tsx           # 入口文件
│   └── index.css          # 全局样式
├── server/                 # 后端代码
│   ├── index.ts           # Express API 服务
│   └── sources/           # 数据源（预留）
├── shared/                 # 共享类型定义
│   └── types.ts
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 部署

### 本地部署

```bash
npm run build
npm run preview
```

### 生产环境

1. 构建前端:
```bash
npm run build
```

2. 部署后端 API（需要 NODE_ENV=production 和 ANTHROPIC_API_KEY 环境变量）

3. 配置前端代理或跨域访问后端

## 后续规划

- [ ] 用户登录体系
- [ ] 外部数据源接入（小红书等）
- [ ] 公众号 H5 版本
- [ ] 历史记录保存
- [ ] 菜谱收藏功能

## License

MIT
