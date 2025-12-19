# LoadingFallback 加载占位组件

**路径**: `src/components/LoadingFallback/index.tsx`

页面加载时的占位组件，显示加载动画和提示文字。

## 概述

`LoadingFallback` 是一个简单的加载占位组件，使用 Ant Design 的 `Spin` 组件显示加载状态。适用于页面初始加载、路由切换等场景。

### 特性

- ✅ 使用 Ant Design Spin 组件
- ✅ 显示"页面加载中..."提示
- ✅ 统一的加载样式
- ✅ 简单易用，无需配置

---

## 安装和导入

### 前置依赖

确保已安装 `antd`：

```bash
pnpm add antd
```

### 导入方式

```typescript
import LoadingFallback from "@/components/LoadingFallback";
```

---

## 基本用法

### 简单使用

```tsx
import LoadingFallback from "@/components/LoadingFallback";

function Page() {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return <LoadingFallback />;
  }

  return <YourContent />;
}
```

### 在路由中使用

```tsx
import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import LoadingFallback from "@/components/LoadingFallback";
import LazyComponent from "./LazyComponent";

function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<LazyComponent />} />
      </Routes>
    </Suspense>
  );
}
```

---

## API 参考

### Props

无 Props，直接使用即可。

---

## 功能说明

### 显示内容

`LoadingFallback` 会显示：

- 大型加载动画（Ant Design Spin）
- "页面加载中..."提示文字
- 全屏居中布局

### 样式

组件使用 `loading-fallback` 类名，可以通过全局样式覆盖自定义样式。

---

## 完整示例

### 示例 1: 页面加载

```tsx
import { useState, useEffect } from "react";
import LoadingFallback from "@/components/LoadingFallback";

function UserProfile() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchUserData().then((data) => {
      setData(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <LoadingFallback />;
  }

  return <div>{/* 用户信息 */}</div>;
}
```

### 示例 2: React Suspense

```tsx
import { Suspense, lazy } from "react";
import LoadingFallback from "@/components/LoadingFallback";

const LazyPage = lazy(() => import("./LazyPage"));

function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <LazyPage />
    </Suspense>
  );
}
```

### 示例 3: 路由加载

```tsx
import { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoadingFallback from "@/components/LoadingFallback";

const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
```

---

## 最佳实践

### 1. 用于页面级加载

`LoadingFallback` 适合用于整个页面的加载状态，而不是局部内容的加载。

### 2. 与 Suspense 配合使用

在代码分割和懒加载场景中，与 React `Suspense` 配合使用：

```tsx
<Suspense fallback={<LoadingFallback />}>
  <LazyComponent />
</Suspense>
```

### 3. 自定义样式

如果需要自定义样式，可以通过全局 CSS 覆盖：

```css
.loading-fallback {
  /* 自定义样式 */
}
```

---

## 注意事项

1. **全屏显示**: `LoadingFallback` 设计为全屏显示，不适合用于局部加载
2. **简单场景**: 对于简单的加载场景，直接使用 Ant Design 的 `Spin` 组件可能更灵活

---

## 相关文档

- [Ant Design Spin](https://ant.design/components/spin-cn/) - Ant Design 加载组件文档
