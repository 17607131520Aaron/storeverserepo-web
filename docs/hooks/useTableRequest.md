# useTableRequest 表格请求 Hook

**路径**: `src/hooks/useTableRequest/useTableRequest.ts`

专门用于表格列表请求的 Hook，解决 tab 切换和快速请求时的竞态问题。

## 概述

`useTableRequest` 是一个专门用于表格列表数据请求的 React Hook。它通过请求序列号机制解决竞态问题，确保只处理最新请求的响应，同时支持 tab 切换和刷新时自动重新请求。

### 特性

- ✅ **竞态问题解决**: 通过请求序列号确保只处理最新请求的响应
- ✅ **自动取消**: 新请求发起时自动取消之前的请求
- ✅ **Tab 切换支持**: 自动监听 tab 切换和刷新，重新请求数据
- ✅ **依赖项监听**: 支持依赖项变化时自动重新请求
- ✅ **TypeScript 类型支持**: 完整的类型推断

---

## 安装和导入

### 导入方式

```typescript
import { useTableRequest } from "@/hooks/useTableRequest";
import type { IUseTableRequestOptions, IUseTableRequestReturn } from "@/hooks/useTableRequest";
```

---

## 基本用法

### 简单使用

```tsx
import { useTableRequest } from "@/hooks/useTableRequest";
import { get } from "@/utils/request";

interface IListParams {
  page: number;
  pageSize: number;
}

interface IListItem {
  id: number;
  name: string;
}

function TablePage() {
  const { data, loading, error, refresh } = useTableRequest<IListParams, IListItem[]>({
    requestFn: async (params, signal) => {
      return get<IListParams, IListItem[]>({
        url: "/api/list",
        data: params,
        cancelToken: signal ? { signal } : undefined,
      });
    },
    params: { page: 1, pageSize: 10 },
  });

  return (
    <VirtualTableComponent
      dataSource={data || []}
      loading={loading}
      // ...
    />
  );
}
```

---

## API 参考

### 配置选项

| 属性                  | 类型                                                        | 必填 | 默认值 | 说明                             |
| --------------------- | ----------------------------------------------------------- | ---- | ------ | -------------------------------- |
| `requestFn`           | `(params: TParams, signal?: AbortSignal) => Promise<TData>` | ✅   | -      | 请求函数，接收参数和 AbortSignal |
| `params`              | `TParams`                                                   | ❌   | -      | 请求参数                         |
| `immediate`           | `boolean`                                                   | ❌   | `true` | 是否立即执行请求                 |
| `deps`                | `React.DependencyList`                                      | ❌   | `[]`   | 依赖项数组，变化时自动重新请求   |
| `refreshOnTabSwitch`  | `boolean`                                                   | ❌   | `true` | tab 切换时是否自动重新请求       |
| `refreshOnTabRefresh` | `boolean`                                                   | ❌   | `true` | tab 刷新时是否自动重新请求       |
| `onSuccess`           | `(data: TData) => void`                                     | ❌   | -      | 请求成功回调                     |
| `onError`             | `(error: Error) => void`                                    | ❌   | -      | 请求失败回调                     |

### 返回值

| 属性      | 类型                                                | 说明           |
| --------- | --------------------------------------------------- | -------------- |
| `data`    | `TData \| null`                                     | 请求返回的数据 |
| `loading` | `boolean`                                           | 加载状态       |
| `error`   | `Error \| null`                                     | 错误信息       |
| `run`     | `(params?: TParams) => Promise<TData \| undefined>` | 手动触发请求   |
| `refresh` | `() => Promise<TData \| undefined>`                 | 手动刷新请求   |
| `cancel`  | `() => void`                                        | 取消当前请求   |

---

## 功能说明

### 竞态问题解决

`useTableRequest` 通过以下机制解决竞态问题：

1. **请求序列号**: 每次请求生成唯一序列号
2. **响应检查**: 响应返回时检查是否为最新请求
3. **自动忽略**: 旧请求的响应会被自动忽略
4. **请求取消**: 使用 `AbortController` 取消之前的请求

### Tab 切换支持

- 自动监听 `location.pathname` 变化
- 自动监听 `refreshKey` 变化（tab 刷新）
- 路径变化时自动重新请求

### 依赖项监听

通过 `deps` 参数监听依赖项变化，自动重新请求：

```tsx
const [keyword, setKeyword] = useState("");

useTableRequest({
  requestFn: fetchData,
  params: { keyword },
  deps: [keyword], // keyword 变化时自动重新请求
});
```

---

## 完整示例

### 示例 1: 基础表格请求

```tsx
import { useTableRequest } from "@/hooks/useTableRequest";
import { get } from "@/utils/request";
import VirtualTableComponent from "@/components/VirtualTable";

interface IUser {
  id: number;
  name: string;
  email: string;
}

function UserListPage() {
  const { data, loading, error } = useTableRequest<{ page: number; pageSize: number }, IUser[]>({
    requestFn: async (params, signal) => {
      return get({
        url: "/api/users",
        data: params,
        cancelToken: signal ? { signal } : undefined,
      });
    },
    params: { page: 1, pageSize: 10 },
  });

  if (error) {
    return <div>错误: {error.message}</div>;
  }

  return (
    <VirtualTableComponent<IUser>
      dataSource={data || []}
      loading={loading}
      // ...
    />
  );
}
```

### 示例 2: 带搜索功能

```tsx
import { useState } from "react";
import { useTableRequest } from "@/hooks/useTableRequest";
import { get } from "@/utils/request";

function UserListPage() {
  const [keyword, setKeyword] = useState("");

  const { data, loading, refresh } = useTableRequest({
    requestFn: async (params, signal) => {
      return get({
        url: "/api/users",
        data: params,
        cancelToken: signal ? { signal } : undefined,
      });
    },
    params: { page: 1, pageSize: 10, keyword },
    deps: [keyword], // keyword 变化时自动重新请求
  });

  return (
    <div>
      <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="搜索用户" />
      <VirtualTableComponent
        dataSource={data?.list || []}
        loading={loading}
        // ...
      />
    </div>
  );
}
```

### 示例 3: 手动刷新和取消

```tsx
function UserListPage() {
  const { data, loading, refresh, cancel } = useTableRequest({
    requestFn: fetchUsers,
    params: { page: 1, pageSize: 10 },
  });

  return (
    <div>
      <div>
        <button onClick={refresh}>刷新</button>
        <button onClick={cancel}>取消请求</button>
      </div>
      <VirtualTableComponent
        dataSource={data || []}
        loading={loading}
        // ...
      />
    </div>
  );
}
```

### 示例 4: 带成功和失败回调

```tsx
import { message } from "antd";

function UserListPage() {
  const { data, loading } = useTableRequest({
    requestFn: fetchUsers,
    params: { page: 1, pageSize: 10 },
    onSuccess: (data) => {
      message.success(`加载了 ${data.length} 条数据`);
    },
    onError: (error) => {
      message.error(`加载失败: ${error.message}`);
    },
  });

  return (
    <VirtualTableComponent
      dataSource={data || []}
      loading={loading}
      // ...
    />
  );
}
```

### 示例 5: 分页请求

```tsx
import { useState } from "react";

function UserListPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, loading } = useTableRequest({
    requestFn: async (params, signal) => {
      return get({
        url: "/api/users",
        data: params,
        cancelToken: signal ? { signal } : undefined,
      });
    },
    params: { page, pageSize },
    deps: [page, pageSize], // 页码或页大小变化时自动重新请求
  });

  return (
    <div>
      <VirtualTableComponent
        dataSource={data?.list || []}
        loading={loading}
        // ...
      />
      <Pagination
        current={page}
        pageSize={pageSize}
        total={data?.total || 0}
        onChange={(p, ps) => {
          setPage(p);
          setPageSize(ps);
        }}
      />
    </div>
  );
}
```

### 示例 6: 禁用自动请求

```tsx
function UserListPage() {
  const { data, loading, run } = useTableRequest({
    requestFn: fetchUsers,
    params: { page: 1, pageSize: 10 },
    immediate: false, // 不自动请求
  });

  return (
    <div>
      <button onClick={() => run()}>手动加载</button>
      <VirtualTableComponent
        dataSource={data || []}
        loading={loading}
        // ...
      />
    </div>
  );
}
```

---

## 最佳实践

### 1. 在请求函数中使用 AbortSignal

确保请求函数支持取消：

```tsx
requestFn: async (params, signal) => {
  return get({
    url: "/api/list",
    data: params,
    cancelToken: signal ? { signal } : undefined,
  });
};
```

### 2. 合理使用依赖项

只在需要时使用 `deps`，避免不必要的请求：

```tsx
// ✅ 好的做法：只在搜索关键词变化时重新请求
const { data } = useTableRequest({
  requestFn: fetchData,
  params: { keyword },
  deps: [keyword],
});

// ❌ 不好的做法：每次渲染都重新请求
const { data } = useTableRequest({
  requestFn: fetchData,
  params: { keyword },
  deps: [], // 缺少 keyword 依赖
});
```

### 3. 处理错误状态

始终处理错误状态：

```tsx
const { data, loading, error } = useTableRequest({
  requestFn: fetchData,
});

if (error) {
  return <div>错误: {error.message}</div>;
}
```

### 4. 与 VirtualTable 配合使用

`useTableRequest` 设计用于与 `VirtualTable` 组件配合：

```tsx
const { data, loading } = useTableRequest({
  requestFn: fetchData,
});

return (
  <VirtualTableComponent
    dataSource={data || []}
    loading={loading}
    // ...
  />
);
```

---

## 注意事项

1. **请求函数必须支持 AbortSignal**: 确保请求函数正确处理 `signal` 参数
2. **依赖项变化**: 使用 `deps` 时，确保依赖项变化会触发重新请求
3. **Tab 切换**: `refreshOnTabSwitch` 和 `refreshOnTabRefresh` 默认开启，如果不需要可以关闭
4. **竞态问题**: Hook 内部已处理竞态问题，无需手动处理

---

## 工作原理

### 请求序列号机制

1. 每次请求生成唯一序列号（`requestIdRef.current++`）
2. 响应返回时检查序列号是否匹配
3. 只有最新请求的响应才会更新状态

### 请求取消机制

1. 新请求发起时，取消之前的请求（`AbortController.abort()`）
2. 响应返回时检查请求是否已取消
3. 已取消的请求响应会被忽略

### Tab 切换检测

1. 监听 `location.pathname` 变化
2. 监听 `refreshKey` 变化（tab 刷新）
3. 路径变化时自动重新请求

---

## 相关文档

- [VirtualTable](../components/VirtualTable.md) - 虚拟表格组件
- [request](../utils/request.md) - HTTP 请求工具
