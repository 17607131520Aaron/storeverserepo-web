# useTabs 标签页管理 Hook

**路径**: `src/app/TabsContext.tsx`

用于管理应用标签页（Tabs）状态的 Hook，提供标签页的添加、删除、切换、刷新等功能。

## 概述

`useTabs` 是一个用于管理多标签页应用的 Hook。它提供了标签页的完整生命周期管理，包括添加、删除、切换、刷新等功能，并自动与路由系统集成。

### 特性

- ✅ 自动管理标签页状态
- ✅ 与路由系统自动集成
- ✅ 支持标签页刷新
- ✅ 支持标签页切换检测
- ✅ 自动从菜单配置获取页面标题

---

## 安装和导入

### 导入方式

```typescript
import { useTabs, TabsProvider } from "@/app/TabsContext";
import type { ITabItem } from "@/app/TabsContext";
```

---

## 基本用法

### 在应用根组件中使用 TabsProvider

```tsx
import { TabsProvider } from "@/app/TabsContext";

function App() {
  return (
    <TabsProvider>
      <YourApp />
    </TabsProvider>
  );
}
```

### 在组件中使用 useTabs

```tsx
import { useTabs } from "@/app/TabsContext";

function MyComponent() {
  const { tabs, activeKey, refreshKey, refreshingKey, isTabSwitching, addTab, removeTab, setActiveTab, refreshTab } =
    useTabs();

  return (
    <div>
      <p>当前活动标签: {activeKey}</p>
      <p>标签数量: {tabs.length}</p>
    </div>
  );
}
```

---

## API 参考

### useTabs 返回值

| 属性                | 类型                            | 说明                         |
| ------------------- | ------------------------------- | ---------------------------- |
| `tabs`              | `ITabItem[]`                    | 所有标签页列表               |
| `activeKey`         | `string`                        | 当前活动标签的 key           |
| `refreshKey`        | `string`                        | 刷新键，用于触发标签页刷新   |
| `refreshingKey`     | `string \| null`                | 正在刷新的标签 key           |
| `isTabSwitching`    | `boolean`                       | 是否正在切换标签             |
| `addTab`            | `(path: string) => void`        | 添加标签页                   |
| `removeTab`         | `(key: string) => void`         | 移除标签页                   |
| `setActiveTab`      | `(key: string) => void`         | 设置活动标签                 |
| `closeOtherTabs`    | `(key: string) => void`         | 关闭其他标签（保留指定标签） |
| `closeAllTabs`      | `() => void`                    | 关闭所有标签（保留首页）     |
| `refreshTab`        | `(key: string) => void`         | 刷新指定标签页               |
| `setRefreshingKey`  | `(key: string \| null) => void` | 设置正在刷新的标签 key       |
| `setIsTabSwitching` | `(value: boolean) => void`      | 设置标签切换状态             |

### ITabItem 接口

```typescript
interface ITabItem {
  key: string; // 标签的唯一标识（通常是路径）
  label: string; // 标签显示文本
  path: string; // 标签对应的路径
  closable?: boolean; // 是否可关闭（首页不可关闭）
}
```

### TabsProvider Props

| 属性       | 类型        | 必填 | 说明   |
| ---------- | ----------- | ---- | ------ |
| `children` | `ReactNode` | ✅   | 子组件 |

---

## 功能说明

### 自动标签管理

`TabsProvider` 会自动监听路由变化，当路由变化时会自动添加对应的标签页。

### 标签页标题

标签页的标题会自动从 `menuItems` 配置中获取，如果找不到则显示"未命名页面"。

### 标签页刷新

刷新标签页会：

1. 设置 `refreshingKey` 状态
2. 触发 `tab-refresh` 自定义事件
3. 更新 `refreshKey` 强制重新渲染

### 标签页切换检测

切换标签页时会设置 `isTabSwitching` 标志，用于区分是标签切换还是路由导航。

---

## 完整示例

### 示例 1: 基础使用

```tsx
import { TabsProvider, useTabs } from "@/app/TabsContext";

function App() {
  return (
    <TabsProvider>
      <AppContent />
    </TabsProvider>
  );
}

function AppContent() {
  const { tabs, activeKey, setActiveTab, removeTab } = useTabs();

  return (
    <div>
      {tabs.map((tab) => (
        <div
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          style={{
            fontWeight: tab.key === activeKey ? "bold" : "normal",
          }}
        >
          {tab.label}
          {tab.closable && <button onClick={() => removeTab(tab.key)}>×</button>}
        </div>
      ))}
    </div>
  );
}
```

### 示例 2: 监听标签页刷新

```tsx
import { useEffect } from "react";
import { useTabs } from "@/app/TabsContext";

function Page() {
  const { refreshKey, refreshingKey } = useTabs();

  useEffect(() => {
    // 监听标签页刷新事件
    const handleRefresh = (event: CustomEvent) => {
      console.log("标签页刷新:", event.detail);
      // 重新加载数据
      loadData();
    };

    window.addEventListener("tab-refresh", handleRefresh as EventListener);

    return () => {
      window.removeEventListener("tab-refresh", handleRefresh as EventListener);
    };
  }, [refreshKey]);
}
```

### 示例 3: 检测标签切换

```tsx
import { useEffect } from "react";
import { useTabs } from "@/app/TabsContext";

function Page() {
  const { isTabSwitching } = useTabs();

  useEffect(() => {
    // 如果是标签切换，不重新加载数据
    if (isTabSwitching) {
      return;
    }

    // 否则重新加载数据
    loadData();
  }, [isTabSwitching]);
}
```

### 示例 4: 与 useTableRequest 配合使用

```tsx
import { useTableRequest } from "@/hooks/useTableRequest";
import { useTabs } from "@/app/TabsContext";

function TablePage() {
  const { refreshKey } = useTabs();

  // useTableRequest 会自动监听 refreshKey 变化
  const { data, loading } = useTableRequest({
    requestFn: fetchData,
    params: { page: 1, pageSize: 10 },
    refreshOnTabRefresh: true, // 标签刷新时自动重新请求
  });

  return <VirtualTableComponent dataSource={data || []} loading={loading} />;
}
```

### 示例 5: 手动刷新标签页

```tsx
import { useTabs } from "@/app/TabsContext";

function Page() {
  const { refreshTab, activeKey } = useTabs();

  const handleRefresh = () => {
    // 刷新当前活动标签
    refreshTab(activeKey);
  };

  return <button onClick={handleRefresh}>刷新页面</button>;
}
```

---

## 最佳实践

### 1. 在应用根组件使用 TabsProvider

`TabsProvider` 应该在应用的最外层使用：

```tsx
function App() {
  return (
    <TabsProvider>
      <Router>
        <Routes>{/* 路由配置 */}</Routes>
      </Router>
    </TabsProvider>
  );
}
```

### 2. 使用 refreshKey 触发数据刷新

在页面组件中监听 `refreshKey` 变化来刷新数据：

```tsx
import { useEffect } from "react";
import { useTabs } from "@/app/TabsContext";

function Page() {
  const { refreshKey } = useTabs();

  useEffect(() => {
    // refreshKey 变化时重新加载数据
    loadData();
  }, [refreshKey]);
}
```

### 3. 使用 isTabSwitching 避免重复加载

在路由变化时，使用 `isTabSwitching` 区分是标签切换还是路由导航：

```tsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTabs } from "@/app/TabsContext";

function Page() {
  const location = useLocation();
  const { isTabSwitching } = useTabs();

  useEffect(() => {
    // 如果是标签切换，不重新加载
    if (isTabSwitching) {
      return;
    }

    // 否则重新加载数据
    loadData();
  }, [location.pathname, isTabSwitching]);
}
```

### 4. 与 useTableRequest 配合使用

`useTableRequest` 已经内置了对 `refreshKey` 和 `isTabSwitching` 的支持，推荐使用：

```tsx
const { data, loading } = useTableRequest({
  requestFn: fetchData,
  refreshOnTabSwitch: true, // 自动处理标签切换
  refreshOnTabRefresh: true, // 自动处理标签刷新
});
```

---

## 注意事项

1. **TabsProvider 必须包裹应用**: `TabsProvider` 必须在应用根组件中使用
2. **路由集成**: 标签页会自动与路由系统集成，无需手动管理
3. **首页标签**: 首页标签（`/`）默认不可关闭
4. **标签标题**: 标签标题从 `menuItems` 配置中获取，确保配置正确

---

## 相关文档

- [useTableRequest](./useTableRequest.md) - 表格请求 Hook（自动支持标签切换和刷新）
- [TabsBar](../components/TabsBar.md) - 标签栏组件（如果存在）

---

## 内部实现说明

### 自动标签添加

`TabsProvider` 会监听 `location.pathname` 变化，自动添加对应的标签页：

```tsx
useEffect(() => {
  const path = location.pathname || "/";
  addTab(path);
}, [location.pathname, addTab]);
```

### 标签页标题获取

标签页标题从 `menuItems` 配置中递归查找：

```tsx
const getPageTitle = (path: string): string => {
  // 从 menuItems 中查找匹配的路径
  // 返回对应的 label，如果找不到则返回"未命名页面"
};
```

### 标签切换标志

切换标签时会设置 `isTabSwitching` 标志，100ms 后自动清除：

```tsx
setIsTabSwitching(true);
navigate(tab.path);
setTimeout(() => {
  setIsTabSwitching(false);
}, 100);
```
