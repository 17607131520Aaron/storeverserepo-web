# StoreVerse Web

一个基于 React + TypeScript + Vite 构建的现代化企业级 Web 应用系统。

## 📋 项目简介

StoreVerse Web 是一个功能完善的企业级管理系统，提供了文档管理、团队协作、数据可视化、条码管理等核心功能。项目采用现代化的前端技术栈，注重代码质量、性能和开发体验。

### 核心特性

- 🚀 **现代化技术栈**: React 18 + TypeScript + Vite
- 🎨 **优秀的 UI 体验**: 基于 Ant Design 6.x 组件库
- 📦 **模块化架构**: 清晰的代码组织和组件化设计
- 🔒 **完善的错误处理**: 全局错误边界和错误上报机制
- ⚡ **性能优化**: 虚拟滚动、请求竞态处理、性能监控
- 💾 **多存储方案**: localStorage、sessionStorage、IndexedDB
- 🔌 **实时通信**: WebSocket 和 Server-Sent Events 支持
- 📱 **响应式设计**: 适配多种屏幕尺寸

---

## 🛠️ 技术栈

### 核心框架

- **React** 18.3.1 - UI 框架
- **TypeScript** 5.9.3 - 类型系统
- **Vite** 7.2.5 (rolldown) - 构建工具

### UI 组件库

- **Ant Design** 6.1.1 - 企业级 UI 组件库
- **@ant-design/icons** 6.1.0 - 图标库

### 路由与状态

- **React Router** 7.11.0 - 路由管理
- **React Query** 3.39.3 - 数据获取和缓存

### 工具库

- **Axios** 1.13.2 - HTTP 请求
- **Socket.io Client** 4.8.1 - WebSocket 通信
- **Dexie** 4.2.1 - IndexedDB 封装
- **Day.js** 1.11.19 - 日期处理
- **Lodash** 4.17.21 - 工具函数库

### 性能优化

- **react-virtualized** 9.22.6 - 虚拟滚动
- **Recharts** 3.6.0 - 数据可视化

### 开发工具

- **ESLint** - 代码检查
- **Prettier** - 代码格式化
- **Stylelint** - 样式检查
- **Husky** - Git Hooks
- **Commitlint** - 提交信息规范

---

## ✨ 功能模块

### 📄 文档管理

- 文档列表（支持虚拟滚动，可渲染 10万+ 数据）
- 文档分类管理
- 回收站功能

### 👥 团队管理

- 成员管理
- 角色权限管理
- 部门管理

### 📊 仪表盘

- 数据概览
- 统计分析

### 📦 条码管理

- 条码生成和管理

### ⚙️ 系统设置

- 基础设置
- 安全设置

### 🔍 调试工具

- 调试日志查看
- 网络请求监控

---

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### 安装依赖

```bash
pnpm install
```

### 开发环境

```bash
# 启动开发服务器
pnpm dev

# 默认访问地址: http://localhost:8000
```

### 构建生产版本

```bash
# 构建生产版本
pnpm build

# 预览生产构建
pnpm preview
```

### 代码检查与格式化

```bash
# 检查代码
pnpm check

# 自动修复代码
pnpm fix

# 单独运行
pnpm lint          # ESLint 检查
pnpm lint:fix      # ESLint 自动修复
pnpm format        # Prettier 格式化
pnpm format:check  # Prettier 检查
pnpm stylelint     # Stylelint 检查
pnpm stylelint:fix # Stylelint 自动修复
```

---

## 📁 项目结构

```
storeverserepo-web/
├── docs/                    # 项目文档
│   ├── components/         # 组件文档
│   ├── hooks/             # Hooks 文档
│   ├── utils/             # 工具方法文档
│   └── types/             # 类型定义文档
├── public/                 # 静态资源
├── src/
│   ├── app/               # 应用主组件
│   │   ├── TabsContext.tsx    # 标签页管理
│   │   ├── TabsBar.tsx        # 标签栏组件
│   │   └── constants.tsx      # 菜单配置
│   ├── components/        # 公共组件
│   │   ├── ErrorBoundary/         # 错误边界
│   │   ├── ErrorReportingProvider/ # 错误上报
│   │   ├── LoadingFallback/       # 加载占位
│   │   ├── PerformanceMonitorWrapper/ # 性能监控
│   │   └── VirtualTable/          # 虚拟表格
│   ├── hooks/             # 自定义 Hooks
│   │   ├── useAuth/               # 认证管理
│   │   ├── usePerformanceMonitor/ # 性能监控
│   │   ├── useSocket/            # WebSocket
│   │   └── useTableRequest/      # 表格请求
│   ├── pages/             # 页面组件
│   │   ├── Documents/            # 文档管理
│   │   ├── Team/                # 团队管理
│   │   ├── Dashboard/           # 仪表盘
│   │   └── ...
│   ├── router/            # 路由配置
│   ├── types/             # 类型定义
│   ├── utils/             # 工具方法
│   │   ├── request.ts            # HTTP 请求
│   │   ├── indexedDBStorage.ts   # IndexedDB
│   │   ├── StorageValue.ts       # 本地存储
│   │   └── errorReporter.ts      # 错误上报
│   ├── main.tsx           # 应用入口
│   └── main.scss          # 全局样式
├── .eslintrc.js          # ESLint 配置
├── .prettierrc           # Prettier 配置
├── commitlint.config.js  # Commitlint 配置
├── postcss.config.js     # PostCSS 配置
├── tsconfig.json         # TypeScript 配置
├── vite.config.ts         # Vite 配置
└── package.json          # 项目配置
```

---

## 📚 文档

项目提供了完整的开发文档，包括：

### 公共组件

- [ErrorBoundary](./docs/components/ErrorBoundary.md) - 错误边界组件
- [ErrorReportingProvider](./docs/components/ErrorReportingProvider.md) - 错误上报提供者
- [LoadingFallback](./docs/components/LoadingFallback.md) - 加载占位组件
- [PerformanceMonitorWrapper](./docs/components/PerformanceMonitorWrapper.md) - 性能监控包装器
- [VirtualTable](./docs/components/VirtualTable.md) - 虚拟滚动表格组件

### Hooks

- [useAuth](./docs/hooks/useAuth.md) - 认证管理 Hook
- [usePerformanceMonitor](./docs/hooks/usePerformanceMonitor.md) - 性能监控 Hook
- [useTableRequest](./docs/hooks/useTableRequest.md) - 表格请求 Hook（解决竞态问题）
- [useSocket](./docs/hooks/useSocket.md) - WebSocket 连接 Hook
- [useTabs](./docs/hooks/useTabs.md) - 标签页管理 Hook

### 工具方法

- [request](./docs/utils/request.md) - HTTP 请求工具
- [indexedDBStorage](./docs/utils/indexedDBStorage.md) - IndexedDB 存储工具
- [StorageValue](./docs/utils/StorageValue.md) - 本地存储工具
- [errorReporter](./docs/utils/errorReporter.md) - 错误上报工具

### 类型定义

- [baseRequest](./docs/types/baseRequest.md) - 请求相关类型
- [react-barcode](./docs/types/react-barcode.md) - 条码组件类型
- [react-virtualized](./docs/types/react-virtualized.md) - 虚拟滚动类型

**完整文档索引**: [查看文档目录](./docs/README.md)

---

## 🔧 环境变量

创建 `.env` 文件配置环境变量：

```env
# 开发服务器端口
VITE_PORT=8000

# API 基础地址
VITE_API_BASE_URL=http://localhost:3000

# API 前缀
VITE_APP_BASE_API=api
```

---

## 💡 开发指南

### 代码规范

项目使用 ESLint + Prettier + Stylelint 保证代码质量：

- **ESLint**: JavaScript/TypeScript 代码检查
- **Prettier**: 代码格式化
- **Stylelint**: CSS/SCSS 样式检查
- **Commitlint**: Git 提交信息规范

### Git 提交规范

项目使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
perf: 性能优化
test: 测试相关
chore: 构建/工具相关
```

### 路径别名

项目配置了路径别名 `@` 指向 `src` 目录：

```typescript
import Component from "@/components/Component";
import { useHook } from "@/hooks/useHook";
import { util } from "@/utils/util";
```

---

## 🎯 核心功能说明

### 错误处理

项目实现了完善的错误处理机制：

- **ErrorBoundary**: 捕获 React 组件错误
- **ErrorReportingProvider**: 全局错误监听和上报
- **errorReporter**: 错误收集和上报工具

### 性能优化

- **虚拟滚动**: 使用 `react-virtualized` 支持大量数据渲染
- **请求竞态处理**: `useTableRequest` Hook 解决快速请求的竞态问题
- **性能监控**: 自动收集和上报页面性能指标

### 数据存储

- **localStorage/sessionStorage**: 临时数据存储
- **IndexedDB**: 大量数据持久化存储
- **Cookie**: 认证信息存储

### 实时通信

- **WebSocket**: 双向实时通信（基于 Socket.io）
- **Server-Sent Events**: 服务端推送

---

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📝 许可证

本项目为私有项目。

---

## 📞 联系方式

如有问题或建议，请联系项目维护者。

---

## 🙏 致谢

感谢所有为项目做出贡献的开发者！

---

**最后更新**: 2025-12-20
