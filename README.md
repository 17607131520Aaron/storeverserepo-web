# StoreVerse Web

一个基于 React + TypeScript + Vite 构建的现代化 Web 应用系统。

## 📋 项目简介

StoreVerse Web 是一个功能完善的企业级管理系统，提供了文档管理、团队协作、数据可视化、条码管理等核心功能。项目采用现代化的前端技术栈，注重代码质量、性能和开发体验。

### 核心特性

- 🚀 **现代化技术栈**: React 18 + TypeScript + Vite (Rolldown)
- 🎨 **优秀的 UI 体验**: 基于 Ant Design 6.x 组件库
- 🌓 **主题系统**: 支持亮色/暗色/自动三种主题模式
- 📦 **模块化架构**: 清晰的代码组织和组件化设计
- 🔒 **完善的错误处理**: 全局错误边界和错误上报机制
- ⚡ **性能优化**: 虚拟滚动、请求竞态处理、性能监控
- 💾 **多存储方案**: localStorage、sessionStorage、IndexedDB
- 🔌 **实时通信**: WebSocket 和 Server-Sent Events 支持
- 📱 **响应式设计**: 适配多种屏幕尺寸
- 🎯 **状态管理**: 基于 Zustand 的轻量级状态管理方案
- 🐳 **Docker 支持**: 完整的 Docker 多环境部署方案
- 🔧 **Jenkins 部署**: 提供 Jenkins 部署脚本，支持传统部署方式

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
- **Zustand** 5.0.9 - 轻量级状态管理

### 工具库

- **Axios** 1.13.2 - HTTP 请求
- **Socket.io Client** 4.8.1 - WebSocket 通信
- **Dexie** 4.2.1 - IndexedDB 封装
- **Day.js** 1.11.19 - 日期处理
- **Lodash** 4.17.21 - 工具函数库
- **js-cookie** 3.0.5 - Cookie 管理
- **ahooks** 3.9.6 - React Hooks 工具库
- **@uidotdev/usehooks** 2.4.1 - 常用 Hooks 集合
- **semver** 7.7.3 - 版本号管理

### 性能优化

- **react-virtualized** 9.22.6 - 虚拟滚动
- **Recharts** 3.6.0 - 数据可视化

### 其他功能库

- **react-barcode** 1.6.1 - 条码生成
- **qrcode.react** 4.2.0 - 二维码生成
- **Sass** 1.97.0 - CSS 预处理器

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

### 📱 React Native 调试工具

- 调试日志查看
- 网络请求监控

---

## 🚀 快速开始

### 环境要求

#### 开发环境

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0

#### Docker 部署（可选）

- **Docker** >= 20.0.0
- **Docker Compose** >= 2.0.0

### 安装依赖

```bash
pnpm install
```

### 开发环境

项目支持多环境模式开发：

```bash
# 测试环境（默认）
pnpm dev
# 或
pnpm dev:test

# 开发环境
pnpm dev:dev

# 生产环境
pnpm dev:prod

# 默认访问地址: http://localhost:8000 (测试环境)
```

### 构建生产版本

项目支持多环境构建：

```bash
# 测试环境构建（默认）
pnpm build
# 或
pnpm build:test

# 开发环境构建
pnpm build:dev

# 生产环境构建
pnpm build:prod

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
├── scripts/                 # 脚本文件
│   ├── docker-deploy.sh   # Docker 部署脚本
│   └── jenkins-deploy.sh  # Jenkins 部署脚本（不使用 Docker）
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
│   │   ├── ThemeProvider/         # 主题提供者
│   │   ├── ThemeToggle/           # 主题切换
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
│   ├── store/             # 状态管理
│   │   ├── config.ts           # 持久化配置
│   │   ├── createPersistStore.ts # Store 工厂函数
│   │   ├── theme/              # 主题状态
│   │   └── user/               # 用户状态
│   ├── types/             # 类型定义
│   ├── utils/             # 工具方法
│   │   ├── request.ts            # HTTP 请求
│   │   ├── indexedDBStorage.ts   # IndexedDB
│   │   ├── StorageValue.ts       # 本地存储
│   │   ├── errorReporter.ts      # 错误上报
│   │   └── theme.ts              # 主题工具
│   ├── main.tsx           # 应用入口
│   └── main.scss          # 全局样式
├── .env.development      # 开发环境变量
├── .env.production       # 生产环境变量
├── .env.test             # 测试环境变量（可选）
├── Dockerfile            # Docker 镜像构建文件
├── docker-compose.yml    # Docker Compose 配置文件（多环境）
├── nginx.conf            # Nginx 配置文件
├── DOCKER.md             # Docker 部署文档
├── .dockerignore         # Docker 忽略文件
├── eslint.config.js     # ESLint 配置
├── .prettierrc           # Prettier 配置
├── .stylelintrc.json     # Stylelint 配置
├── .lintstagedrc.js      # Lint-staged 配置
├── commitlint.config.js  # Commitlint 配置
├── postcss.config.js     # PostCSS 配置
├── tsconfig.json         # TypeScript 配置
├── vite.config.ts        # Vite 配置
└── package.json          # 项目配置
```

---

## 🔧 环境变量

项目支持多环境配置，通过 `.env.{mode}` 文件管理不同环境的变量：

### 环境文件

- `.env.development` - 开发环境配置
- `.env.production` - 生产环境配置
- `.env.test` - 测试环境配置（可选）

### 常用环境变量

```env
# 开发服务器端口
VITE_PORT=8000

# API 基础地址
VITE_API_BASE_URL=http://localhost:3000

# API 前缀
VITE_APP_BASE_API=api

# WebSocket 地址
VITE_SOCKET_URL=http://localhost:3000

# Metro Logger 端口（用于 React Native 调试）
VITE_METRO_LOGGER_PORT=8081
VITE_METRO_LOGGER_PATH=/logs
```

### 使用方式

环境变量会根据运行模式（`--mode`）自动加载对应的配置文件。在代码中通过 `import.meta.env.VITE_*` 访问。

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

- **虚拟滚动**: 使用 `react-virtualized` 支持大量数据渲染（可渲染 10万+ 数据）
- **请求竞态处理**: `useTableRequest` Hook 解决快速请求的竞态问题
- **性能监控**: 自动收集和上报页面性能指标

### 状态管理

项目使用 **Zustand** 进行状态管理，并实现了持久化机制：

- **持久化配置**: 通过命名空间（`模块名/功能名`）控制哪些状态需要持久化
- **自动恢复**: 持久化的状态会在应用启动时自动恢复
- **类型安全**: 完整的 TypeScript 类型支持
- **轻量级**: 相比 Redux 更简洁，无需额外的 Provider

详细使用说明请参考 [Store 配置文档](./src/store/README.md)

### 数据存储

- **localStorage/sessionStorage**: 临时数据存储（通过 `StorageValue` 工具封装）
- **IndexedDB**: 大量数据持久化存储（通过 `Dexie` 封装，用于认证信息等）
- **Cookie**: 认证信息存储（通过 `js-cookie` 管理）
- **Zustand Persist**: 状态持久化（自动同步到 localStorage）

### 实时通信

- **WebSocket**: 双向实时通信（基于 Socket.io，支持自动重连）
- **Server-Sent Events**: 服务端推送（通过 `useSSE` Hook 使用）

### 主题系统

项目实现了完整的主题切换功能：

- **三种模式**: 亮色模式、暗色模式、自动跟随系统
- **持久化存储**: 主题偏好自动保存到本地存储
- **Ant Design 集成**: 自动同步主题到 Ant Design 组件
- **系统主题检测**: 自动模式会根据系统主题自动切换

### 构建优化

- **Rolldown**: 使用基于 Rust 的 Rolldown 打包器，构建速度更快
- **代码分割**: 智能分包策略，按模块和依赖自动拆分
- **资源优化**: 自动压缩和优化 CSS、JS、图片等资源
- **Lightning CSS**: 使用 Lightning CSS 进行 CSS 转换和压缩

---

## 🚀 部署

项目支持多种部署方式，可根据实际需求选择：

### 部署方式对比

| 部署方式         | 适用场景                   | 端口配置                              | 文档                     |
| ---------------- | -------------------------- | ------------------------------------- | ------------------------ |
| **Docker**       | 容器化部署，推荐生产环境   | test: 8001<br>prod: 8000              | [DOCKER.md](./DOCKER.md) |
| **Podman**       | 容器化部署（Podman 用户）  | dev/test: 8001<br>prod: 8000          | 见下方                   |
| **Jenkins**      | 传统服务器部署，CI/CD 集成 | dev: 3000<br>test: 3001<br>prod: 3002 | 见下方                   |
| **GitHub Pages** | 静态站点托管               | -                                     | 见下方                   |

> **注意**: Docker 部署中，`dev` 和 `test` 环境指向同一个测试环境配置（端口 8001），只有 `test` 和 `prod` 两个独立环境。

### Docker 部署（推荐）

项目支持通过 Docker 进行多环境部署，提供完整的容器化解决方案：

#### 快速部署

```bash
# 测试环境（dev 和 test 都使用此配置）
./scripts/docker-deploy.sh test
# 或
./scripts/docker-deploy.sh dev   # dev 等同于 test

# 生产环境
./scripts/docker-deploy.sh prod
```

#### 可用操作

```bash
# 构建并部署（默认操作）
./scripts/docker-deploy.sh test build
# 或简写
./scripts/docker-deploy.sh test

# 仅启动容器
./scripts/docker-deploy.sh test up

# 停止并删除容器
./scripts/docker-deploy.sh test down

# 重启容器
./scripts/docker-deploy.sh test restart

# 查看日志
./scripts/docker-deploy.sh test logs

# 停止容器（不删除）
./scripts/docker-deploy.sh test stop

# 启动已存在的容器
./scripts/docker-deploy.sh test start

# 手动备份镜像
./scripts/docker-deploy.sh test backup
```

#### 特性

- ✅ **多环境支持**: test（dev 等同于 test）、prod 两个环境
- ✅ **自动镜像命名**: 格式为 `项目id-环境-时间戳`，同时打上环境标签和 latest 标签
- ✅ **自动备份**: 构建前自动备份旧镜像到 `./deploy-backup/{环境}/` 目录（按环境分类）
- ✅ **自动清理**: 自动清理 30 天前的备份文件和超过 5 个的时间戳镜像
- ✅ **自动启动**: 构建完成后自动停止旧容器并启动新容器
- ✅ **统一管理**: 统一使用 docker-compose 管理容器，确保配置一致性
- ✅ **Nginx 配置**: 完整的 Nginx 配置，支持 SPA 路由、Gzip 压缩、API 代理等

#### 访问地址

部署完成后，可通过以下地址访问：

- **测试环境**: `http://localhost:8001`
- **生产环境**: `http://localhost:8000`

#### 详细文档

完整的 Docker 部署文档请参考：[Docker 部署指南](./DOCKER.md)

### Podman 部署

项目支持通过 Podman 进行多环境部署，适用于使用 Podman 替代 Docker 的场景：

#### 快速部署

```bash
# 开发/测试环境
./scripts/podman-deploy.sh dev
# 或
./scripts/podman-deploy.sh test

# 生产环境
./scripts/podman-deploy.sh prod
```

#### 可用操作

```bash
# 构建并部署（默认操作）
./scripts/podman-deploy.sh prod deploy
# 或简写
./scripts/podman-deploy.sh prod

# 仅构建镜像
./scripts/podman-deploy.sh prod build

# 启动容器
./scripts/podman-deploy.sh prod start

# 停止容器
./scripts/podman-deploy.sh prod stop

# 重启容器
./scripts/podman-deploy.sh prod restart

# 查看日志
./scripts/podman-deploy.sh prod logs

# 查看状态
./scripts/podman-deploy.sh prod status

# 清理历史镜像
./scripts/podman-deploy.sh prod clean
```

#### 环境变量配置

可通过环境变量自定义后端服务地址：

```bash
# 自定义后端地址（推荐：使用宿主机 IP）
BACKEND_HOST=192.168.1.100 ./scripts/podman-deploy.sh prod

# 自定义后端端口
BACKEND_PORT=8888 ./scripts/podman-deploy.sh prod

# 同时设置后端地址和端口
BACKEND_HOST=192.168.1.100 BACKEND_PORT=9000 ./scripts/podman-deploy.sh prod
```

#### 访问地址

部署完成后，可通过以下地址访问：

- **开发/测试环境**: `http://localhost:8001`
- **生产环境**: `http://localhost:8000`

#### 故障排查

**问题：接口无法访问，但本地启动时正常**

这是最常见的问题，原因是容器内的 `localhost` 指向容器本身，无法访问宿主机上的后端服务。

**解决方案（按优先级）：**

1. **使用宿主机 IP（推荐）**

   ```bash
   # 获取宿主机 IP（macOS/Linux）
   ifconfig | grep "inet " | grep -v 127.0.0.1

   # 使用 IP 地址部署
   BACKEND_HOST=192.168.1.100 ./scripts/podman-deploy.sh prod
   ```

2. **使用 host.containers.internal（Podman 4.0+）**
   - 脚本会自动将 `localhost` 转换为 `host.containers.internal`
   - 如果 Podman 版本不支持，请使用方案 1

3. **检查后端服务是否运行**

   ```bash
   # 检查后端服务是否在运行
   curl http://localhost:9000/health
   # 或
   lsof -i :9000
   ```

4. **查看容器日志**

   ```bash
   ./scripts/podman-deploy.sh prod logs
   ```

5. **检查 Nginx 配置**
   ```bash
   # 进入容器查看配置
   podman exec -it storeverserepo-web-prod cat /etc/nginx/conf.d/default.conf | grep proxy_pass
   ```

**其他常见问题：**

- **端口被占用**：修改脚本中的 `CONTAINER_PORT` 或停止占用端口的服务
- **镜像构建失败**：检查网络连接和 Dockerfile 配置
- **容器启动失败**：查看容器日志 `podman logs storeverserepo-web-prod`

### Jenkins 部署（不使用 Docker）

项目提供了 Jenkins 部署脚本，适用于不使用 Docker 的传统部署方式：

#### 快速部署

```bash
# 测试环境
./scripts/jenkins-deploy.sh test

# 开发环境
./scripts/jenkins-deploy.sh dev

# 生产环境
./scripts/jenkins-deploy.sh prod
```

#### 可用操作

```bash
# 仅构建项目
./scripts/jenkins-deploy.sh prod build

# 仅部署（需要先构建）
./scripts/jenkins-deploy.sh prod deploy

# 备份当前部署版本
./scripts/jenkins-deploy.sh prod backup

# 回滚到上一个版本
./scripts/jenkins-deploy.sh prod rollback
```

#### 特性

- ✅ **多环境支持**: dev、test、prod 三个环境
- ✅ **跨平台支持**: 自动适配 macOS 和 Linux 环境
- ✅ **自动备份**: 部署前自动备份当前版本到 `./deploy-backup/` 目录
- ✅ **Jenkins 检查**: 构建前自动检查 Jenkins 服务状态
- ✅ **Nginx 集成**: 自动重新加载 Nginx 配置（可选）
- ✅ **Nginx 配置建议**: 在 macOS 上提供详细的 Nginx 配置示例
- ✅ **回滚支持**: 支持一键回滚到上一个版本
- ✅ **权限管理**: 自动设置正确的文件权限
- ✅ **生产环境路径处理**: 自动处理 GitHub Pages 部署路径（`/storeverserepo-web/`）

#### 默认部署目录和端口

**Linux 环境：**

- **dev**: `/usr/share/nginx/html-dev` (端口: 3000)
- **test**: `/usr/share/nginx/html-test` (端口: 3001)
- **prod**: `/usr/share/nginx/html` (端口: 3002)

**macOS 环境（本地部署）：**

- **dev**: `./deploy/dev` (端口: 3000)
- **test**: `./deploy/test` (端口: 3001)
- **prod**: `./deploy/prod` (端口: 3002)

> **注意**: Jenkins 部署方式中，`dev`、`test`、`prod` 是三个独立的环境，与 Docker 部署不同。

> 💡 **提示**: 在 macOS 上，脚本会自动检测并使用本地部署目录，避免需要 sudo 权限。部署完成后，需要配置 Nginx 来服务这些目录，脚本会提供详细的配置建议。

#### 环境变量配置

可通过环境变量自定义部署行为：

```bash
# 自定义部署目录
DEPLOY_DIR=/custom/path ./scripts/jenkins-deploy.sh prod

# 自定义备份目录
BACKUP_DIR=/custom/backup ./scripts/jenkins-deploy.sh prod

# 跳过 Nginx 重启
RESTART_NGINX=false ./scripts/jenkins-deploy.sh prod

# 强制要求 Jenkins 服务运行
REQUIRE_JENKINS=true ./scripts/jenkins-deploy.sh prod

# 跳过 Jenkins 检查
SKIP_JENKINS_CHECK=true ./scripts/jenkins-deploy.sh prod
```

#### 在 Jenkins Pipeline 中使用

```groovy
stage('Deploy') {
    steps {
        sh './scripts/jenkins-deploy.sh prod'
    }
}
```

### GitHub Pages

项目配置了 GitHub Actions 自动部署到 GitHub Pages：

- **触发条件**: 推送到 `master` 分支或手动触发
- **构建流程**:
  1. CodeQL 代码安全扫描
  2. 代码质量检查（ESLint、Prettier、Stylelint）
  3. 构建生产版本
  4. 部署到 `gh-pages` 分支
- **访问地址**: `https://{username}.github.io/storeverserepo-web/`

### 手动部署

```bash
# 构建生产版本
pnpm build:prod

# 将 dist 目录部署到你的服务器
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
