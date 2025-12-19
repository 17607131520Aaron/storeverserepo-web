# ErrorReportingProvider 错误上报提供者

**路径**: `src/components/ErrorReportingProvider/index.tsx`

全局错误监听提供者组件，用于初始化全局错误监听（脚本错误、Promise 未捕获异常）。

## 概述

`ErrorReportingProvider` 是一个 React 组件，用于在应用启动时初始化全局错误监听。它会监听全局的 JavaScript 运行时错误和未捕获的 Promise 拒绝，并自动上报到错误收集系统。

### 特性

- ✅ 自动监听全局 JavaScript 运行时错误
- ✅ 自动监听未捕获的 Promise 拒绝
- ✅ 自动上报错误到错误收集系统
- ✅ 组件卸载时自动清理监听器
- ✅ 防止重复初始化

---

## 安装和导入

### 导入方式

```typescript
import ErrorReportingProvider from "@/components/ErrorReportingProvider";
```

---

## 基本用法

### 在应用根组件中使用

```tsx
import ErrorReportingProvider from "@/components/ErrorReportingProvider";
import ErrorBoundary from "@/components/ErrorBoundary";

function App() {
  return (
    <ErrorReportingProvider>
      <ErrorBoundary scope="App">
        <YourApp />
      </ErrorBoundary>
    </ErrorReportingProvider>
  );
}
```

---

## API 参考

### Props

| 属性       | 类型        | 必填 | 说明   |
| ---------- | ----------- | ---- | ------ |
| `children` | `ReactNode` | ✅   | 子组件 |

---

## 功能说明

### 错误监听类型

`ErrorReportingProvider` 会监听以下类型的错误：

1. **运行时错误** (`runtime-error`)
   - JavaScript 执行错误
   - 语法错误
   - 类型错误等

2. **未捕获的 Promise 拒绝** (`unhandled-rejection`)
   - Promise 被拒绝但未处理
   - async/await 未捕获的错误

### 错误上报信息

当错误发生时，会自动收集以下信息并上报：

- 错误类型
- 错误消息
- 错误堆栈
- 文件名和行号（如果可用）
- 当前 URL
- User-Agent
- 时间戳

### 初始化机制

- 只在浏览器环境中初始化
- 防止重复初始化（使用内部标志）
- 组件卸载时自动清理监听器

---

## 完整示例

### 示例 1: 基础使用

```tsx
import ErrorReportingProvider from "@/components/ErrorReportingProvider";
import ErrorBoundary from "@/components/ErrorBoundary";
import AppRoutes from "./AppRoutes";

function App() {
  return (
    <ErrorReportingProvider>
      <ErrorBoundary scope="App">
        <AppRoutes />
      </ErrorBoundary>
    </ErrorReportingProvider>
  );
}
```

### 示例 2: 自定义错误上报

```tsx
import ErrorReportingProvider from "@/components/ErrorReportingProvider";
import { setClientIssueReporter } from "@/utils/errorReporter";

// 在应用启动前设置自定义上报函数
setClientIssueReporter(async (payload) => {
  await fetch("/api/error-report", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
});

function App() {
  return (
    <ErrorReportingProvider>
      <YourApp />
    </ErrorReportingProvider>
  );
}
```

---

## 最佳实践

### 1. 在应用根组件使用

`ErrorReportingProvider` 应该在应用的最外层使用，确保所有错误都能被捕获：

```tsx
function App() {
  return (
    <ErrorReportingProvider>
      <Router>
        <Routes>{/* 路由配置 */}</Routes>
      </Router>
    </ErrorReportingProvider>
  );
}
```

### 2. 与 ErrorBoundary 配合使用

`ErrorReportingProvider` 负责全局错误监听，`ErrorBoundary` 负责 React 组件错误：

```tsx
<ErrorReportingProvider>
  <ErrorBoundary scope="App">
    <YourApp />
  </ErrorBoundary>
</ErrorReportingProvider>
```

### 3. 只使用一次

`ErrorReportingProvider` 内部有防重复初始化机制，但建议只在应用根组件中使用一次。

---

## 注意事项

1. **浏览器环境**: 只在浏览器环境中生效，服务端渲染时不会初始化
2. **错误上报配置**: 需要先配置错误上报函数（通过 `setClientIssueReporter`）
3. **不会捕获的错误**: 以下错误不会被捕获：
   - React 组件渲染错误（由 `ErrorBoundary` 处理）
   - 已处理的 Promise 错误
   - 事件处理器中的错误（需要使用 `withClientErrorGuard`）

---

## 相关文档

- [ErrorBoundary](./ErrorBoundary.md) - 错误边界组件
- [errorReporter](../utils/errorReporter.md) - 错误上报工具
