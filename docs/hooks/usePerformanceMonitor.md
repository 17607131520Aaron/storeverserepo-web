# usePerformanceMonitor 性能监控 Hook

**路径**: `src/hooks/usePerformanceMonitor/usePerformanceMonitorHook.ts`

用于获取和记录页面性能指标的 Hook。

## 概述

`usePerformanceMonitor` 是一个 React Hook，用于获取和记录页面性能指标。它使用浏览器 Performance API 收集页面加载性能数据，包括 DNS 查询、TCP 连接、DOM 解析等指标，以及 Web Vitals 指标（FCP、LCP、FID、CLS）。

### 特性

- ✅ 自动收集页面性能指标
- ✅ 支持 Web Vitals 指标（FCP、LCP、FID、CLS）
- ✅ 控制台美化输出性能数据
- ✅ 自动保存到 IndexedDB
- ✅ 支持自定义性能上报函数

---

## 安装和导入

### 导入方式

```typescript
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";
import { setPagePerformanceReporter } from "@/hooks/usePerformanceMonitor";
```

---

## 基本用法

### 简单使用

```tsx
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";

function Page() {
  const { getPerformanceMetrics, logPagePerformance } = usePerformanceMonitor();

  useEffect(() => {
    // 页面加载完成后记录性能指标
    logPagePerformance("page-id");
  }, []);

  // 手动获取性能指标
  const metrics = getPerformanceMetrics();
  console.log("性能指标:", metrics);
}
```

---

## API 参考

### 返回值

| 属性                    | 类型                             | 说明                   |
| ----------------------- | -------------------------------- | ---------------------- |
| `getPerformanceMetrics` | `() => IPerformanceData \| null` | 获取当前页面的性能指标 |
| `logPagePerformance`    | `(pageId?: string) => void`      | 记录并上报页面性能指标 |

### IPerformanceData 接口

```typescript
interface IPerformanceData {
  dnsTime: number; // DNS 查询时间（ms）
  tcpTime: number; // TCP 连接时间（ms）
  requestTime: number; // 请求响应时间（ms）
  domParseTime: number; // DOM 解析时间（ms）
  domContentLoadedTime: number; // DOMContentLoaded 时间（ms）
  loadTime: number; // 页面加载时间（ms）
  totalTime: number; // 总加载时间（ms）
  fcp: number; // 首次内容绘制（ms）
  lcp: number; // 最大内容绘制（ms）
  fid: number; // 首次输入延迟（ms）
  cls: number; // 累积布局偏移
}
```

### setPagePerformanceReporter

```typescript
setPagePerformanceReporter(reporter: PagePerformanceReporter): void;
```

设置自定义性能上报函数。

---

## 功能说明

### 性能指标说明

#### 基础性能指标

- **DNS 查询时间** (`dnsTime`): 域名解析耗时
- **TCP 连接时间** (`tcpTime`): TCP 连接建立耗时
- **请求响应时间** (`requestTime`): HTTP 请求响应耗时
- **DOM 解析时间** (`domParseTime`): DOM 解析耗时
- **DOMContentLoaded 时间** (`domContentLoadedTime`): DOMContentLoaded 事件耗时
- **页面加载时间** (`loadTime`): load 事件耗时
- **总加载时间** (`totalTime`): 页面总加载时间

#### Web Vitals 指标

- **FCP** (`fcp`): 首次内容绘制时间（First Contentful Paint）
- **LCP** (`lcp`): 最大内容绘制时间（Largest Contentful Paint）
- **FID** (`fid`): 首次输入延迟（First Input Delay）
- **CLS** (`cls`): 累积布局偏移（Cumulative Layout Shift）

### 数据存储

性能数据会自动保存到 IndexedDB，存储键为 `performance_metrics`。

### 控制台输出

性能数据会在控制台以美化格式输出，包含所有指标和性能评估（✅/⚠️）。

---

## 完整示例

### 示例 1: 基础使用

```tsx
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";

function Page() {
  const { logPagePerformance } = usePerformanceMonitor();

  useEffect(() => {
    // 页面加载完成后记录性能指标
    logPagePerformance("home-page");
  }, []);

  return <div>页面内容</div>;
}
```

### 示例 2: 手动获取性能指标

```tsx
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";

function PerformanceDashboard() {
  const { getPerformanceMetrics } = usePerformanceMonitor();
  const [metrics, setMetrics] = useState<IPerformanceData | null>(null);

  const handleGetMetrics = () => {
    const data = getPerformanceMetrics();
    setMetrics(data);
  };

  return (
    <div>
      <button onClick={handleGetMetrics}>获取性能指标</button>
      {metrics && (
        <div>
          <p>DNS 查询时间: {metrics.dnsTime.toFixed(2)}ms</p>
          <p>TCP 连接时间: {metrics.tcpTime.toFixed(2)}ms</p>
          <p>总加载时间: {metrics.totalTime.toFixed(2)}ms</p>
          {metrics.fcp > 0 && (
            <p>
              FCP: {metrics.fcp.toFixed(2)}ms {metrics.fcp < 1800 ? "✅" : "⚠️"}
            </p>
          )}
          {metrics.lcp > 0 && (
            <p>
              LCP: {metrics.lcp.toFixed(2)}ms {metrics.lcp < 2500 ? "✅" : "⚠️"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
```

### 示例 3: 自定义性能上报

```tsx
import { setPagePerformanceReporter } from "@/hooks/usePerformanceMonitor";

// 在应用启动时设置
setPagePerformanceReporter(async (payload) => {
  await fetch("/api/performance", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
});

function App() {
  return <YourApp />;
}
```

### 示例 4: 路由性能监控

```tsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";

function RoutePerformanceMonitor() {
  const location = useLocation();
  const { logPagePerformance } = usePerformanceMonitor();

  useEffect(() => {
    // 路由变化时记录性能指标
    const timer = setTimeout(() => {
      logPagePerformance(location.pathname);
    }, 1000);

    return () => clearTimeout(timer);
  }, [location.pathname, logPagePerformance]);

  return null;
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

### 1. 在页面加载完成后记录

使用 `useEffect` 在页面加载完成后记录性能指标：

```tsx
useEffect(() => {
  // 延迟一下确保所有指标都已收集
  const timer = setTimeout(() => {
    logPagePerformance("page-id");
  }, 1000);

  return () => clearTimeout(timer);
}, []);
```

### 2. 设置性能上报

在生产环境中，建议设置性能上报函数：

```tsx
import { setPagePerformanceReporter } from "@/hooks/usePerformanceMonitor";

setPagePerformanceReporter(async (payload) => {
  await fetch("/api/performance", {
    method: "POST",
    body: JSON.stringify(payload),
  });
});
```

### 3. 分析性能数据

定期分析 IndexedDB 中的性能数据：

```tsx
import { getAllProjectInfo } from "@/utils/indexedDBStorage";

const allMetrics = await getAllProjectInfo();
const performanceData = allMetrics.filter((item) => item.key.startsWith("performance_"));
```

### 4. 与 PerformanceMonitorWrapper 配合使用

使用 `PerformanceMonitorWrapper` 组件自动监控所有页面：

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

## 注意事项

1. **浏览器支持**: 需要浏览器支持 Performance API
2. **页面加载时机**: 性能指标在页面 `load` 事件后收集，可能需要等待确保所有指标都已收集
3. **数据量**: IndexedDB 中会存储大量性能数据，注意定期清理
4. **Web Vitals**: 部分 Web Vitals 指标（如 LCP、FID、CLS）可能需要用户交互才能收集完整

---

## 相关文档

- [PerformanceMonitorWrapper](../components/PerformanceMonitorWrapper.md) - 性能监控包装器组件
- [indexedDBStorage](../utils/indexedDBStorage.md) - IndexedDB 存储工具
