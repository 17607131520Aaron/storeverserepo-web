# PerformanceMonitorWrapper 性能监控包装器

**路径**: `src/components/PerformanceMonitorWrapper/index.tsx`

性能监控包装器组件，自动收集和上报页面性能指标。

## 概述

`PerformanceMonitorWrapper` 是一个包装器组件，用于自动收集和上报页面性能指标。它会监听页面加载完成事件，自动收集性能数据并保存到 IndexedDB，同时支持自定义性能上报函数。

### 特性

- ✅ 自动收集页面性能指标（DNS、TCP、DOM 解析等）
- ✅ 自动收集 Web Vitals 指标（FCP、LCP、FID、CLS）
- ✅ 自动保存性能数据到 IndexedDB
- ✅ 支持自定义性能上报函数
- ✅ 控制台美化输出性能数据

---

## 安装和导入

### 导入方式

```typescript
import PerformanceMonitorWrapper from "@/components/PerformanceMonitorWrapper";
```

---

## 基本用法

### 在应用根组件中使用

```tsx
import PerformanceMonitorWrapper from "@/components/PerformanceMonitorWrapper";

function App() {
  return (
    <PerformanceMonitorWrapper>
      <YourApp />
    </PerformanceMonitorWrapper>
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

### 性能指标说明

`PerformanceMonitorWrapper` 会收集以下性能指标：

#### 基础性能指标

- **DNS 查询时间** (`dnsTime`): 域名解析耗时（ms）
- **TCP 连接时间** (`tcpTime`): TCP 连接建立耗时（ms）
- **请求响应时间** (`requestTime`): HTTP 请求响应耗时（ms）
- **DOM 解析时间** (`domParseTime`): DOM 解析耗时（ms）
- **DOMContentLoaded 时间** (`domContentLoadedTime`): DOMContentLoaded 事件耗时（ms）
- **页面加载时间** (`loadTime`): load 事件耗时（ms）
- **总加载时间** (`totalTime`): 页面总加载时间（ms）

#### Web Vitals 指标

- **FCP** (`fcp`): 首次内容绘制时间（First Contentful Paint，ms）
- **LCP** (`lcp`): 最大内容绘制时间（Largest Contentful Paint，ms）
- **FID** (`fid`): 首次输入延迟（First Input Delay，ms）
- **CLS** (`cls`): 累积布局偏移（Cumulative Layout Shift）

### 数据存储

性能数据会自动保存到 IndexedDB，存储键为 `performance_metrics`。

### 控制台输出

性能数据会在控制台以美化格式输出，包含所有指标和性能评估（✅/⚠️）。

---

## 完整示例

### 示例 1: 基础使用

```tsx
import PerformanceMonitorWrapper from "@/components/PerformanceMonitorWrapper";
import AppRoutes from "./AppRoutes";

function App() {
  return (
    <PerformanceMonitorWrapper>
      <AppRoutes />
    </PerformanceMonitorWrapper>
  );
}
```

### 示例 2: 自定义性能上报

```tsx
import PerformanceMonitorWrapper from "@/components/PerformanceMonitorWrapper";
import { setPagePerformanceReporter } from "@/hooks/usePerformanceMonitor";

// 在应用启动前设置自定义上报函数
setPagePerformanceReporter(async (payload) => {
  await fetch("/api/performance", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
});

function App() {
  return (
    <PerformanceMonitorWrapper>
      <YourApp />
    </PerformanceMonitorWrapper>
  );
}
```

### 示例 3: 手动获取性能指标

```tsx
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";

function Page() {
  const { getPerformanceMetrics, logPagePerformance } = usePerformanceMonitor();

  useEffect(() => {
    // 页面加载完成后记录性能指标
    logPagePerformance("page-id");
  }, []);

  // 手动获取性能指标
  const handleGetMetrics = () => {
    const metrics = getPerformanceMetrics();
    console.log("性能指标:", metrics);
  };

  return <button onClick={handleGetMetrics}>获取性能指标</button>;
}
```

---

## 性能指标参考值

### Web Vitals 推荐值

- **FCP**: < 1800ms ✅
- **LCP**: < 2500ms ✅
- **FID**: < 100ms ✅
- **CLS**: < 0.1 ✅

### 性能评估

控制台输出会根据指标值自动显示 ✅（良好）或 ⚠️（需要优化）。

---

## 最佳实践

### 1. 在应用根组件使用

`PerformanceMonitorWrapper` 应该在应用的最外层使用，确保所有页面都能被监控：

```tsx
function App() {
  return (
    <PerformanceMonitorWrapper>
      <Router>
        <Routes>{/* 路由配置 */}</Routes>
      </Router>
    </PerformanceMonitorWrapper>
  );
}
```

### 2. 设置性能上报

在生产环境中，建议设置性能上报函数，将性能数据发送到后端：

```tsx
import { setPagePerformanceReporter } from "@/hooks/usePerformanceMonitor";

setPagePerformanceReporter(async (payload) => {
  // 上报到后端
  await fetch("/api/performance", {
    method: "POST",
    body: JSON.stringify(payload),
  });
});
```

### 3. 分析性能数据

定期分析 IndexedDB 中的性能数据，识别性能瓶颈：

```tsx
import { getAllProjectInfo } from "@/utils/indexedDBStorage";

const allMetrics = await getAllProjectInfo();
const performanceData = allMetrics.filter((item) => item.key.startsWith("performance_"));
```

---

## 注意事项

1. **浏览器支持**: 需要浏览器支持 Performance API
2. **页面加载时机**: 性能指标在页面 `load` 事件后收集，可能需要等待 1 秒确保所有指标都已收集
3. **数据量**: IndexedDB 中会存储大量性能数据，注意定期清理

---

## 相关文档

- [usePerformanceMonitor](../hooks/usePerformanceMonitor.md) - 性能监控 Hook
- [indexedDBStorage](../utils/indexedDBStorage.md) - IndexedDB 存储工具
