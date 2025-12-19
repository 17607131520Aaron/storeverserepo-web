# 项目介绍

## 📋 项目概述

**storeverserepo-web** 是一个基于现代前端技术栈构建的企业级 PC 端管理系统。项目采用模块化设计，提供完整的文档管理、团队协作、数据分析和系统配置等功能，适用于企业内部资源管理和协作场景。

### 核心特性

- 🎨 **现代化 UI**：基于 Ant Design 6.x 构建，提供统一美观的用户界面
- ⚡ **高性能**：使用 Vite + React 19，支持路由懒加载和代码分割
- 🔄 **实时通信**：内置 WebSocket/SSE 支持，实现实时数据推送
- 📱 **多标签页**：支持多页面标签管理，提升操作效率
- 🛡️ **类型安全**：完整的 TypeScript 类型定义，提供良好的开发体验
- 📏 **代码规范**：统一的 ESLint + Prettier + Stylelint 规范，保证代码质量

---

## 🛠️ 技术栈

### 核心框架

- **React 19.2.0** - 用户界面构建库
- **TypeScript 5.9.3** - 类型安全的 JavaScript 超集
- **Vite 7.2.5** (rolldown-vite) - 下一代前端构建工具

### UI 组件库

- **Ant Design 6.1.1** - 企业级 UI 设计语言和组件库
- **@ant-design/icons 6.1.0** - Ant Design 图标库

### 路由与状态管理

- **React Router DOM 7.11.0** - 声明式路由管理
- **React Query 3.39.3** - 服务端状态管理和数据获取

### 实时通信

- **Socket.io Client 4.8.1** - WebSocket 双向通信
- **自定义 useSocket Hook** - 封装 WebSocket/SSE 连接管理

### 工具库

- **Axios 1.13.2** - HTTP 客户端
- **Day.js 1.11.19** - 轻量级日期处理库
- **Lodash 4.17.21** - JavaScript 工具函数库
- **Dexie 4.2.1** - IndexedDB 封装库
- **js-cookie 3.0.5** - Cookie 操作库

### 图表与可视化

- **Recharts 3.6.0** - 基于 React 的图表库
- **React Virtualized 9.22.6** - 虚拟滚动组件

### 条码与二维码

- **react-barcode 1.6.1** - 条码生成组件
- **qrcode.react 4.2.0** - 二维码生成组件

### 开发工具

- **ESLint 9.39.1** - JavaScript/TypeScript 代码检查
- **Prettier 3.7.4** - 代码格式化工具
- **Stylelint 16.26.1** - CSS/SCSS 代码检查
- **TypeScript ESLint** - TypeScript 专用 ESLint 规则
- **Husky 9.1.7** - Git Hooks 管理
- **Commitlint** - Git 提交信息规范检查

---

## 📁 项目结构

```
storeverserepo-web/
├── src/
│   ├── app/                    # 应用主布局
│   │   ├── index.tsx          # 主应用组件（侧边栏、头部、标签页）
│   │   ├── constants.tsx      # 菜单配置
│   │   ├── TabsBar.tsx        # 多标签页组件
│   │   └── TabsContext.tsx    # 标签页状态管理
│   ├── components/            # 公共组件
│   │   └── LoadingFallback/  # 加载中组件
│   ├── hooks/                 # 自定义 Hooks
│   │   └── useSocket/        # WebSocket/SSE 通信 Hook
│   ├── pages/                 # 页面组件
│   │   ├── Home/             # 首页
│   │   ├── Dashboard/        # 仪表盘模块
│   │   │   ├── Overview/     # 数据概览
│   │   │   └── Analysis/     # 统计分析
│   │   ├── Documents/        # 文档管理模块
│   │   │   ├── List/         # 文档列表
│   │   │   ├── Category/     # 文档分类
│   │   │   └── Trash/        # 回收站
│   │   ├── Team/             # 团队管理模块
│   │   │   ├── Members/      # 成员管理
│   │   │   ├── Roles/        # 角色权限
│   │   │   └── Departments/  # 部门管理
│   │   ├── Barcode/          # 条码管理模块
│   │   │   └── Manage/       # 条码生成
│   │   ├── Settings/         # 系统设置模块
│   │   │   ├── Basic/        # 基础设置
│   │   │   └── Security/     # 安全设置
│   │   └── smartserviceappDebug/  # 服务通APP调试工具
│   │       ├── Debuglogs/    # 调试日志
│   │       └── Network/      # 网络调试
│   ├── router/                # 路由配置
│   │   └── index.tsx         # 路由定义
│   ├── utils/                 # 工具函数
│   │   └── request/          # HTTP 请求封装
│   └── types/                 # TypeScript 类型定义
├── docs/                      # 项目文档
│   └── useSocket.md          # useSocket Hook 使用文档
├── public/                    # 静态资源
├── vite.config.ts            # Vite 构建配置
├── tsconfig.json             # TypeScript 配置
├── eslint.config.js          # ESLint 配置
├── package.json              # 项目依赖配置
└── README.md                 # 项目说明文档
```

---

## 🎯 功能模块

### 1. 仪表盘（Dashboard）

提供数据概览和统计分析功能，帮助用户快速了解系统整体情况。

- **数据概览** (`/dashboard/overview`)：展示关键指标和统计数据
- **统计分析** (`/dashboard/analysis`)：提供数据分析和可视化图表

### 2. 文档管理（Documents）

完整的文档生命周期管理，支持文档的创建、分类、检索和恢复。

- **文档列表** (`/documents/list`)：文档的增删改查操作
- **文档分类** (`/documents/category`)：文档分类体系管理
- **回收站** (`/documents/trash`)：已删除文档的恢复和管理

### 3. 团队管理（Team）

企业组织架构和权限管理，支持多层级部门和角色体系。

- **成员管理** (`/team/members`)：团队成员信息管理
- **角色权限** (`/team/roles`)：角色定义和权限配置
- **部门管理** (`/team/departments`)：组织架构管理

### 4. 条码管理（Barcode）

支持多种条码和二维码的生成与管理。

- **条码生成** (`/barcode/manage`)：
  - 支持多种条码格式（EAN-13、Code128、QR Code 等）
  - 批量生成条码
  - 条码预览和打印

### 5. 系统设置（Settings）

系统配置和安全策略管理。

- **基础设置** (`/settings/basic`)：系统基本参数配置
- **安全设置** (`/settings/security`)：安全策略和权限控制
- **日志管理** (`/settings/logs`)：系统日志查看和管理

### 6. 服务通APP调试工具（SmartserviceappDebug）

专用于移动端应用调试的工具集。

- **调试日志** (`/smartserviceappDebug/debuglogs`)：实时查看移动端日志
- **网络调试** (`/smartserviceappDebug/network`)：网络请求监控和分析

---

## ✨ 核心功能特性

### 1. 多标签页管理

- 支持多页面同时打开，通过标签页快速切换
- 标签页状态持久化，刷新页面后保持打开状态
- 支持标签页关闭、刷新等操作

### 2. 实时通信支持

项目内置了完善的实时通信解决方案：

- **useSocket Hook**：基于 Socket.io 的 WebSocket 连接管理
  - 自动连接管理
  - 连接状态追踪
  - 自动重连机制
  - 连接复用优化
  - 类型安全的 API

- **useSSE Hook**：基于 EventSource 的 Server-Sent Events 支持
  - 服务端推送数据
  - 自动重连
  - 事件监听管理

详细使用文档请参考：[useSocket Hook 使用文档](./docs/useSocket.md)

### 3. 路由懒加载

所有页面组件采用 React.lazy 实现按需加载，优化首屏加载速度：

```typescript
const DashboardOverview = lazy(() => import('@/pages/Dashboard/Overview'));
```

### 4. 代码分割优化

通过 Vite 的 advancedChunks 配置实现智能代码分割：

- React 核心库单独打包
- Ant Design 组件库单独打包
- 图表库、Socket 库等按需分割
- 页面代码和公共代码分离

### 5. 类型安全

- 完整的 TypeScript 类型定义
- 严格的类型检查配置
- 接口、类型、枚举统一命名规范（PascalCase，接口以 I 开头）

### 6. 代码规范

项目采用统一的代码规范体系：

- **Prettier**：负责代码格式化（行宽 100、双引号、LF 换行）
- **ESLint**：负责代码质量和风格检查
- **Stylelint**：负责样式代码检查

详细规范说明请参考：[README.md](./README.md)

---

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0（推荐使用 pnpm 管理依赖）

### 安装依赖

```bash
pnpm install
```

### 开发环境运行

```bash
pnpm dev
```

项目将在 `http://localhost:8000` 启动（端口可通过环境变量 `VITE_PORT` 配置）

### 构建生产版本

```bash
pnpm build
```

构建产物将输出到 `dist` 目录

### 代码检查与格式化

```bash
# 代码检查
pnpm lint

# 代码格式化
pnpm format

# 自动修复代码问题
pnpm lint:fix

# 样式检查
pnpm stylelint

# 完整检查（代码 + 格式 + 样式）
pnpm check

# 自动修复所有问题
pnpm fix
```

---

## ⚙️ 环境配置

项目使用环境变量进行配置，支持以下变量：

- `VITE_PORT`：开发服务器端口（默认：8000）
- `VITE_API_BASE_URL`：API 基础地址（默认：http://localhost:3000）
- `VITE_SOCKET_URL`：WebSocket 服务器地址（默认：http://localhost:3000）
- `VITE_METRO_LOGGER_PORT`：Metro Logger 端口（默认：8081）

创建 `.env.local` 文件进行本地配置：

```env
VITE_PORT=8000
VITE_API_BASE_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

---

## 📦 构建优化

### 代码分割策略

项目采用智能代码分割策略，将代码按以下规则分割：

1. **vendor-react**：React 核心库（优先级最高）
2. **vendor-antd**：Ant Design 组件库
3. **vendor-charts**：图表库（Recharts、React Virtualized）
4. **vendor-socket**：Socket.io 相关
5. **vendor-query**：React Query
6. **vendor-barcode**：条码和二维码库
7. **vendor-utils**：工具库（Lodash、Day.js、Axios 等）
8. **pages**：所有页面代码
9. **hooks**：自定义 Hooks
10. **router**：路由配置
11. **common**：公共代码（被多个入口共享）

### 性能优化

- **路由懒加载**：减少首屏加载时间
- **代码分割**：按需加载，减少初始包大小
- **依赖预构建**：Vite 自动预构建常用依赖
- **CSS 代码分割**：按页面拆分 CSS，减少冗余
- **资源内联**：小于 4KB 的资源自动内联为 base64

### 构建产物

构建后的文件结构：

```
dist/
├── js/
│   ├── vendor-react-[hash].js      # React 核心库
│   ├── vendor-antd-[hash].js       # Ant Design
│   ├── pages-[hash].js             # 页面代码
│   └── ...
├── css/
│   ├── [name]-[hash].css           # 样式文件
│   └── ...
├── images/
│   └── [name]-[hash].[ext]         # 图片资源
└── index.html                      # 入口 HTML
```

---

## 🔧 开发指南

### 添加新页面

1. 在 `src/pages` 目录下创建页面组件
2. 在 `src/router/index.tsx` 中添加路由配置
3. 在 `src/app/constants.tsx` 中添加菜单项配置

### 使用 useSocket Hook

```typescript
import { useSocket } from '@/hooks/useSocket';

function MyComponent() {
  const { isConnected, on, emit } = useSocket({
    url: 'ws://localhost:3000',
    autoConnect: true,
  });

  useEffect(() => {
    const unsubscribe = on('message', (data) => {
      console.log('收到消息:', data);
    });
    return unsubscribe;
  }, [on]);

  const handleSend = () => {
    emit('sendMessage', { text: 'Hello' });
  };

  return <div>...</div>;
}
```

详细文档请参考：[useSocket Hook 使用文档](./docs/useSocket.md)

### 代码规范

项目遵循严格的代码规范，开发时请注意：

1. **命名规范**：
   - 接口以 `I` 开头，使用 PascalCase
   - 类型别名、枚举、类使用 PascalCase
   - 变量和函数使用 camelCase

2. **导入顺序**：
   - React 相关库
   - 第三方库
   - 内部模块（@/ 别名）
   - 类型导入

3. **代码长度**：
   - 单文件不超过 300 行
   - 单行代码不超过 100 字符（字符串和注释除外）

---

## 📝 相关文档

- [README.md](./README.md) - 项目说明和代码规范
- [docs/useSocket.md](./docs/useSocket.md) - useSocket Hook 使用文档

---

## 📄 许可证

本项目为私有项目，版权归项目所有者所有。

---

## 👥 贡献指南

1. 遵循项目的代码规范（ESLint + Prettier + Stylelint）
2. 提交前运行 `pnpm check` 确保代码质量
3. 使用有意义的提交信息（遵循 Commitlint 规范）
4. 为新功能添加适当的类型定义和文档

---

## 🔗 相关链接

- [React 官方文档](https://react.dev/)
- [Vite 官方文档](https://vitejs.dev/)
- [Ant Design 官方文档](https://ant.design/)
- [TypeScript 官方文档](https://www.typescriptlang.org/)

---

**最后更新**：2024年
