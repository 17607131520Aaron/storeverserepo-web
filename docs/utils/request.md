# request HTTP 请求工具

**路径**: `src/utils/request.ts`

基于 axios 封装的 HTTP 请求工具，提供统一的请求和响应处理。

## 概述

`request` 工具基于 `axios` 封装，提供了统一的 HTTP 请求方法（GET、POST、PUT、DELETE）和文件上传功能。它自动处理 token 认证、错误处理、重试机制等。

### 特性

- ✅ 自动添加 Authorization token
- ✅ 统一错误处理（401、403、404、500）
- ✅ 自动重试机制
- ✅ 请求取消支持
- ✅ 业务错误处理（code !== 0）
- ✅ 文件上传支持

---

## 安装和导入

### 前置依赖

确保已安装 `axios` 和 `antd`：

```bash
pnpm add axios antd
```

### 导入方式

```typescript
import { get, post, put, del, uploadFile, uploadSingleFile } from "@/utils/request";
import type { IRequestConfig, IResponse } from "@/types/baseRequest";
```

---

## 基本用法

### GET 请求

```tsx
import { get } from "@/utils/request";

// 简单请求
const data = await get<{ id: number }, { name: string }>({
  url: "/api/user",
  data: { id: 1 },
});

// 带配置的请求
const result = await get({
  url: "/api/users",
  data: { page: 1, pageSize: 10 },
  timeout: 10000,
  retry: 3,
});
```

### POST 请求

```tsx
import { post } from "@/utils/request";

const result = await post<{ name: string }, { id: number }>({
  url: "/api/user",
  data: { name: "张三" },
});
```

### PUT 请求

```tsx
import { put } from "@/utils/request";

await put<{ id: number; name: string }, void>({
  url: "/api/user",
  data: { id: 1, name: "李四" },
});
```

### DELETE 请求

```tsx
import { del } from "@/utils/request";

await del<{ id: number }, void>({
  url: "/api/user",
  data: { id: 1 },
});
```

---

## API 参考

### 请求方法

```typescript
function get<T, R>(config: IRequestConfig<T>): Promise<R>;
function post<T, R>(config: IRequestConfig<T>): Promise<R>;
function put<T, R>(config: IRequestConfig<T>): Promise<R>;
function del<T, R>(config: IRequestConfig<T>): Promise<R>;
```

### IRequestConfig 接口

```typescript
interface IRequestConfig<T = unknown> {
  url: string; // 请求 URL
  data?: T; // 请求数据（GET 作为 params，其他作为 body）
  handleRaw?: boolean; // 是否返回原始响应（不解析 code）
  timeout?: number; // 超时时间（ms），默认 5000
  cancelToken?: AbortController; // 取消令牌
  retry?: number; // 重试次数，默认 0
}
```

### IResponse 接口

```typescript
interface IResponse<T = unknown> {
  code: number; // 业务状态码，0 表示成功
  data: T; // 响应数据
  message: string; // 响应消息
}
```

---

## 功能说明

### 自动 Token 认证

请求会自动从 `localStorage` 读取 `token`，并添加到请求头的 `Authorization` 字段：

```
Authorization: Bearer <token>
```

### 统一错误处理

#### HTTP 错误（4xx、5xx）

- **401**: 登录超时，自动清除 token 并跳转到登录页
- **403**: 权限错误，显示权限错误提示
- **404**: 资源不存在，显示 404 提示
- **500**: 服务器错误，显示服务器错误提示

#### 业务错误（code !== 0）

当响应状态码为 200，但 `code !== 0` 时，会抛出业务错误异常。

### 自动重试

通过 `retry` 参数设置重试次数：

```tsx
const data = await get({
  url: "/api/data",
  retry: 3, // 最多重试 3 次
});
```

**不会重试的情况**:

- 请求被取消
- 401 认证错误
- 业务逻辑错误（code !== 0）
- 已达到最大重试次数

### 请求取消

使用 `AbortController` 取消请求：

```tsx
const controller = new AbortController();

const promise = get({
  url: "/api/data",
  cancelToken: controller,
});

// 取消请求
controller.abort();
```

---

## 完整示例

### 示例 1: 基础请求

```tsx
import { get, post } from "@/utils/request";

// GET 请求
async function fetchUser(id: number) {
  try {
    const user = await get<{ id: number }, { name: string; email: string }>({
      url: "/api/user",
      data: { id },
    });
    return user;
  } catch (error) {
    console.error("获取用户失败:", error);
    throw error;
  }
}

// POST 请求
async function createUser(name: string, email: string) {
  try {
    const result = await post<{ name: string; email: string }, { id: number }>({
      url: "/api/user",
      data: { name, email },
    });
    return result;
  } catch (error) {
    console.error("创建用户失败:", error);
    throw error;
  }
}
```

### 示例 2: 带错误处理

```tsx
import { get } from "@/utils/request";
import { message } from "antd";

async function fetchData() {
  try {
    const data = await get({ url: "/api/data" });
    return data;
  } catch (error) {
    // HTTP 错误（401、403、404、500）已在拦截器中处理并显示通知
    // 业务错误（code !== 0）会抛出异常
    if (error instanceof Error) {
      message.error(`请求失败: ${error.message}`);
    }
    throw error;
  }
}
```

### 示例 3: 请求取消

```tsx
import { useEffect, useRef } from "react";
import { get } from "@/utils/request";

function Component() {
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    abortControllerRef.current = controller;

    get({
      url: "/api/data",
      cancelToken: controller,
    }).catch((error) => {
      if (error.name !== "AbortError") {
        console.error("请求失败:", error);
      }
    });

    return () => {
      controller.abort();
    };
  }, []);
}
```

### 示例 4: 带重试的请求

```tsx
import { get } from "@/utils/request";

async function fetchDataWithRetry() {
  const data = await get({
    url: "/api/data",
    retry: 3, // 最多重试 3 次
    timeout: 10000, // 10 秒超时
  });
  return data;
}
```

### 示例 5: 返回原始响应

```tsx
import { get } from "@/utils/request";

// 使用 handleRaw 返回原始响应（不解析 code）
const response = await get({
  url: "/api/data",
  handleRaw: true, // 返回完整的 IResponse 对象
});

console.log(response.code); // 业务状态码
console.log(response.data); // 响应数据
console.log(response.message); // 响应消息
```

### 示例 6: 文件上传

```tsx
import { uploadFile, uploadSingleFile } from "@/utils/request";

// 单文件上传
async function uploadSingle(file: File) {
  const result = await uploadSingleFile<{ url: string }>({
    url: "/api/upload",
    data: file,
  });
  return result.url;
}

// 多文件上传
async function uploadMultiple(files: File[]) {
  const result = await uploadFile<{ urls: string[] }>({
    url: "/api/upload",
    data: files,
  });
  return result.urls;
}
```

### 示例 7: 与 useTableRequest 配合使用

```tsx
import { useTableRequest } from "@/hooks/useTableRequest";
import { get } from "@/utils/request";

function TablePage() {
  const { data, loading } = useTableRequest({
    requestFn: async (params, signal) => {
      return get({
        url: "/api/list",
        data: params,
        cancelToken: signal ? { signal } : undefined,
      });
    },
    params: { page: 1, pageSize: 10 },
  });

  return <VirtualTableComponent dataSource={data || []} loading={loading} />;
}
```

---

## 最佳实践

### 1. 统一错误处理

HTTP 错误已在拦截器中统一处理，业务错误需要手动处理：

```tsx
try {
  const data = await get({ url: "/api/data" });
} catch (error) {
  // 业务错误处理
  if (error instanceof Error) {
    // 处理业务错误
  }
}
```

### 2. 使用 TypeScript 类型

充分利用 TypeScript 类型推断：

```tsx
// ✅ 好的做法：明确类型
const user = await get<{ id: number }, { name: string }>({
  url: "/api/user",
  data: { id: 1 },
});

// ❌ 不好的做法：不指定类型
const user = await get({ url: "/api/user", data: { id: 1 } });
```

### 3. 请求取消

在组件卸载或条件变化时取消请求：

```tsx
useEffect(() => {
  const controller = new AbortController();

  get({
    url: "/api/data",
    cancelToken: controller,
  });

  return () => {
    controller.abort();
  };
}, []);
```

### 4. 合理设置超时和重试

根据业务需求设置合适的超时和重试：

```tsx
// 重要请求：长超时 + 重试
const data = await get({
  url: "/api/critical-data",
  timeout: 30000,
  retry: 3,
});

// 快速请求：短超时 + 不重试
const quickData = await get({
  url: "/api/quick-data",
  timeout: 5000,
  retry: 0,
});
```

---

## 注意事项

1. **Token 存储**: token 存储在 `localStorage` 的 `token` 键中
2. **Base URL**: 通过环境变量 `VITE_APP_BASE_API` 配置 API 基础路径
3. **错误通知**: HTTP 错误会自动显示 Ant Design 的 `notification` 提示
4. **业务错误**: 业务错误（code !== 0）会抛出异常，需要手动捕获处理

---

## 相关文档

- [useTableRequest](../hooks/useTableRequest.md) - 表格请求 Hook
- [baseRequest](../types/baseRequest.md) - 请求相关类型定义
