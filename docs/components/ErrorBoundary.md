# ErrorBoundary 错误边界组件

**路径**: `src/components/ErrorBoundary/index.tsx`

React 错误边界组件，用于捕获子组件树中的 JavaScript 错误，并显示降级 UI。

## 概述

`ErrorBoundary` 是一个 React 类组件，用于捕获并处理子组件树中发生的 JavaScript 错误。当错误发生时，它会显示一个友好的错误页面，而不是让整个应用崩溃。

### 特性

- ✅ 自动捕获 React 组件渲染错误
- ✅ 自动上报错误到错误收集系统
- ✅ 提供默认错误页面（刷新页面、重试按钮）
- ✅ 支持自定义错误页面
- ✅ 支持错误作用域标识

---

## 安装和导入

### 导入方式

```typescript
import ErrorBoundary from "@/components/ErrorBoundary";
```

---

## 基本用法

### 简单使用

```tsx
import ErrorBoundary from "@/components/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <YourComponent />
    </ErrorBoundary>
  );
}
```

### 带作用域标识

```tsx
import ErrorBoundary from "@/components/ErrorBoundary";

function Page() {
  return (
    <ErrorBoundary scope="UserProfile">
      <UserProfile />
    </ErrorBoundary>
  );
}
```

### 自定义错误页面

```tsx
import ErrorBoundary from "@/components/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary
      scope="App"
      fallback={
        <div>
          <h1>出错了</h1>
          <p>请联系管理员</p>
        </div>
      }
    >
      <YourApp />
    </ErrorBoundary>
  );
}
```

---

## API 参考

### Props

| 属性       | 类型        | 必填 | 默认值       | 说明                                         |
| ---------- | ----------- | ---- | ------------ | -------------------------------------------- |
| `children` | `ReactNode` | ✅   | -            | 子组件                                       |
| `scope`    | `string`    | ❌   | `"App"`      | 错误作用域，用于错误上报时标识错误发生的位置 |
| `fallback` | `ReactNode` | ❌   | 默认错误页面 | 自定义错误页面 UI，当错误发生时显示          |

---

## 功能说明

### 错误捕获机制

`ErrorBoundary` 使用 React 的错误边界机制：

1. **getDerivedStateFromError**: 当子组件抛出错误时，更新组件状态
2. **componentDidCatch**: 捕获错误信息并上报到错误收集系统

### 错误上报

当错误发生时，`ErrorBoundary` 会自动调用 `reportClientIssue` 上报错误，包含以下信息：

- 错误类型: `"react-render"`
- 错误消息: 错误对象的 message
- 错误堆栈: 错误对象的 stack
- 组件堆栈: React 组件堆栈信息
- 作用域: 通过 `scope` prop 指定的作用域

### 默认错误页面

如果不提供 `fallback` prop，`ErrorBoundary` 会显示默认的错误页面，包含：

- 错误标题: "页面出错了"
- 错误消息: 错误对象的 message
- 刷新按钮: 刷新整个页面
- 重试按钮: 重置错误状态，重新渲染子组件

---

## 完整示例

### 示例 1: 页面级错误边界

```tsx
import ErrorBoundary from "@/components/ErrorBoundary";
import UserProfile from "./UserProfile";

function UserProfilePage() {
  return (
    <ErrorBoundary scope="UserProfilePage">
      <UserProfile />
    </ErrorBoundary>
  );
}
```

### 示例 2: 应用级错误边界

```tsx
import ErrorBoundary from "@/components/ErrorBoundary";
import { ErrorReportingProvider } from "@/components/ErrorReportingProvider";
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

### 示例 3: 自定义错误页面

```tsx
import ErrorBoundary from "@/components/ErrorBoundary";
import { Result, Button } from "antd";

function App() {
  return (
    <ErrorBoundary
      scope="App"
      fallback={
        <Result
          status="error"
          title="页面加载失败"
          subTitle="抱歉，页面出现了错误，请稍后重试"
          extra={[
            <Button type="primary" onClick={() => window.location.reload()}>
              刷新页面
            </Button>,
          ]}
        />
      }
    >
      <YourApp />
    </ErrorBoundary>
  );
}
```

---

## 最佳实践

### 1. 在关键位置使用错误边界

- 应用根组件
- 路由页面组件
- 关键功能模块

### 2. 合理设置作用域

使用有意义的 `scope` 值，便于在错误日志中定位问题：

```tsx
<ErrorBoundary scope="UserProfile">
  <UserProfile />
</ErrorBoundary>

<ErrorBoundary scope="OrderList">
  <OrderList />
</ErrorBoundary>
```

### 3. 与 ErrorReportingProvider 配合使用

`ErrorBoundary` 会自动调用错误上报，但需要先初始化全局错误监听：

```tsx
import ErrorBoundary from "@/components/ErrorBoundary";
import ErrorReportingProvider from "@/components/ErrorReportingProvider";

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

### 4. 错误边界不会捕获的错误

以下错误不会被 `ErrorBoundary` 捕获：

- 事件处理器中的错误（使用 `withClientErrorGuard` 包装）
- 异步代码中的错误（setTimeout、Promise 等）
- 服务端渲染错误
- 错误边界自身的错误

---

## 注意事项

1. **错误边界必须是类组件**: `ErrorBoundary` 使用类组件实现，因为函数组件目前不支持错误边界
2. **只能捕获子组件错误**: 错误边界只能捕获其子组件树中的错误，不能捕获自身的错误
3. **错误上报依赖**: 需要确保已正确配置错误上报系统（通过 `ErrorReportingProvider`）

---

## 相关文档

- [ErrorReportingProvider](./ErrorReportingProvider.md) - 错误上报提供者
- [errorReporter](../utils/errorReporter.md) - 错误上报工具
