# errorReporter 错误上报工具

**路径**: `src/utils/errorReporter.ts`

客户端错误收集和上报工具。

## 概述

`errorReporter` 是一个客户端错误收集和上报工具。它提供了全局错误监听、手动错误上报、函数包装等功能，帮助开发者收集和上报应用中的各种错误。

### 特性

- ✅ 自动监听全局 JavaScript 错误
- ✅ 自动监听未捕获的 Promise 拒绝
- ✅ 支持手动上报错误
- ✅ 支持函数包装自动错误捕获
- ✅ 自动添加 URL、User-Agent、时间戳等信息

---

## 安装和导入

### 导入方式

```typescript
import {
  reportClientIssue,
  initGlobalClientErrorReporting,
  setClientIssueReporter,
  withClientErrorGuard,
} from "@/utils/errorReporter";
import type { IClientIssuePayload } from "@/utils/errorReporter";
```

---

## 基本用法

### 初始化全局错误监听

```tsx
import { initGlobalClientErrorReporting } from "@/utils/errorReporter";

// 在应用启动时调用一次
initGlobalClientErrorReporting();
```

### 设置自定义上报函数

```tsx
import { setClientIssueReporter } from "@/utils/errorReporter";

// 设置自定义上报函数
setClientIssueReporter(async (payload) => {
  await fetch("/api/error-report", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
});
```

### 手动上报错误

```tsx
import { reportClientIssue } from "@/utils/errorReporter";

reportClientIssue({
  type: "interaction-error",
  message: "用户操作失败",
  scope: "UserProfile",
  actionName: "保存用户信息",
});
```

### 包装函数自动捕获错误

```tsx
import { withClientErrorGuard } from "@/utils/errorReporter";

const handleSave = withClientErrorGuard("保存用户信息", async () => {
  await saveUser();
});
```

---

## API 参考

### reportClientIssue

手动上报错误。

```typescript
reportClientIssue(payload: IClientIssuePayload): Promise<void>;
```

### IClientIssuePayload 接口

```typescript
interface IClientIssuePayload {
  type: "runtime-error" | "unhandled-rejection" | "react-render" | "interaction-error";
  message: string;
  stack?: string;
  componentStack?: string;
  scope?: string;
  actionName?: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  extra?: Record<string, unknown>;
}
```

### initGlobalClientErrorReporting

初始化全局错误监听。

```typescript
initGlobalClientErrorReporting(): (() => void) | undefined;
```

返回清理函数，用于移除监听器。

### setClientIssueReporter

设置自定义错误上报函数。

```typescript
setClientIssueReporter(sender: ReportSender): void;
```

### withClientErrorGuard

包装函数，自动捕获并上报错误。

```typescript
withClientErrorGuard<T extends (...args: unknown[]) => unknown>(
  actionName: string,
  fn: T
): T;
```

---

## 功能说明

### 错误类型

#### runtime-error

JavaScript 运行时错误，包括：

- 语法错误
- 类型错误
- 引用错误等

#### unhandled-rejection

未捕获的 Promise 拒绝，包括：

- Promise.reject()
- async/await 未捕获的错误

#### react-render

React 组件渲染错误，由 `ErrorBoundary` 组件捕获。

#### interaction-error

用户交互错误，通过 `withClientErrorGuard` 包装的函数捕获。

### 自动收集的信息

错误上报时会自动添加以下信息：

- `url`: 当前页面 URL
- `userAgent`: 浏览器 User-Agent
- `timestamp`: 错误发生时间戳

---

## 完整示例

### 示例 1: 初始化错误监听

```tsx
import { useEffect } from "react";
import { initGlobalClientErrorReporting, setClientIssueReporter } from "@/utils/errorReporter";

function App() {
  useEffect(() => {
    // 设置自定义上报函数
    setClientIssueReporter(async (payload) => {
      await fetch("/api/error-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    });

    // 初始化全局错误监听
    const cleanup = initGlobalClientErrorReporting();

    return () => {
      // 清理监听器
      if (cleanup) {
        cleanup();
      }
    };
  }, []);

  return <YourApp />;
}
```

### 示例 2: 手动上报错误

```tsx
import { reportClientIssue } from "@/utils/errorReporter";

async function saveUser(userData: IUser) {
  try {
    await api.saveUser(userData);
  } catch (error) {
    // 手动上报错误
    reportClientIssue({
      type: "interaction-error",
      message: error instanceof Error ? error.message : "保存用户失败",
      stack: error instanceof Error ? error.stack : undefined,
      scope: "UserProfile",
      actionName: "保存用户信息",
      extra: {
        userData,
      },
    });
    throw error;
  }
}
```

### 示例 3: 包装函数自动捕获

```tsx
import { withClientErrorGuard } from "@/utils/errorReporter";

// 包装异步函数
const handleSubmit = withClientErrorGuard("提交表单", async (formData: IFormData) => {
  await api.submitForm(formData);
});

// 包装同步函数
const handleClick = withClientErrorGuard("点击按钮", () => {
  // 可能出错的代码
  doSomething();
});

// 在 JSX 中使用
<button onClick={handleClick}>提交</button>;
```

### 示例 4: 在 ErrorBoundary 中使用

```tsx
import ErrorBoundary from "@/components/ErrorBoundary";
import { reportClientIssue } from "@/utils/errorReporter";

// ErrorBoundary 内部会自动调用 reportClientIssue
function App() {
  return (
    <ErrorBoundary scope="App">
      <YourApp />
    </ErrorBoundary>
  );
}
```

### 示例 5: 自定义错误处理

```tsx
import { setClientIssueReporter } from "@/utils/errorReporter";

setClientIssueReporter(async (payload) => {
  // 过滤某些错误
  if (payload.type === "runtime-error" && payload.message.includes("ResizeObserver")) {
    // 忽略 ResizeObserver 错误
    return;
  }

  // 上报到后端
  await fetch("/api/error-report", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  // 同时上报到第三方服务（如 Sentry）
  if (window.Sentry) {
    window.Sentry.captureException(new Error(payload.message), {
      extra: payload,
    });
  }
});
```

---

## 最佳实践

### 1. 在应用启动时初始化

在应用根组件中初始化全局错误监听：

```tsx
function App() {
  useEffect(() => {
    setClientIssueReporter(customReporter);
    initGlobalClientErrorReporting();
  }, []);

  return <YourApp />;
}
```

### 2. 设置自定义上报函数

在生产环境中设置自定义上报函数：

```tsx
setClientIssueReporter(async (payload) => {
  await fetch("/api/error-report", {
    method: "POST",
    body: JSON.stringify(payload),
  });
});
```

### 3. 使用 withClientErrorGuard 包装关键操作

包装可能出错的用户交互：

```tsx
const handleSave = withClientErrorGuard("保存数据", async () => {
  await saveData();
});

const handleDelete = withClientErrorGuard("删除数据", async () => {
  await deleteData();
});
```

### 4. 提供有意义的 actionName

使用描述性的 `actionName`，便于定位问题：

```tsx
// ✅ 好的做法
withClientErrorGuard("保存用户信息", saveUser);

// ❌ 不好的做法
withClientErrorGuard("操作", saveUser);
```

### 5. 添加额外的上下文信息

在错误上报时添加额外的上下文信息：

```tsx
reportClientIssue({
  type: "interaction-error",
  message: "操作失败",
  scope: "UserProfile",
  actionName: "保存用户信息",
  extra: {
    userId: currentUser.id,
    formData: formValues,
  },
});
```

---

## 注意事项

1. **只初始化一次**: `initGlobalClientErrorReporting` 应该只调用一次
2. **浏览器环境**: 只在浏览器环境中生效
3. **错误上报失败**: 如果上报函数抛出错误，会被静默捕获，不会影响业务流程
4. **性能影响**: 错误监听对性能影响很小，可以放心使用

---

## 相关文档

- [ErrorBoundary](../components/ErrorBoundary.md) - 错误边界组件
- [ErrorReportingProvider](../components/ErrorReportingProvider.md) - 错误上报提供者组件
