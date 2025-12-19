# baseRequest 请求相关类型定义

**路径**: `src/types/baseRequest.d.ts`

定义 HTTP 请求和响应相关的 TypeScript 类型。

## 概述

`baseRequest.d.ts` 定义了项目中 HTTP 请求和响应相关的 TypeScript 类型，包括请求配置、响应数据、菜单项等类型定义。

---

## 类型定义

### IMenuItem - 菜单项类型

```typescript
interface IMenuItem {
  id: string;
  key: string;
  title: string;
  label: string;
  code: string;
  path: string;
  icon?: React.ReactNode | null;
  sortOrder: number;
  children?: Array<IMenuItem> | undefined;
}
```

用于定义应用菜单项的结构。

**字段说明**:

- `id`: 菜单项唯一标识
- `key`: 菜单项键值
- `title`: 菜单项标题
- `label`: 菜单项显示标签
- `code`: 菜单项代码
- `path`: 菜单项路径
- `icon`: 菜单项图标（可选）
- `sortOrder`: 排序顺序
- `children`: 子菜单项（可选）

### IRequestConfig - 请求配置

```typescript
interface IRequestConfig<T = unknown> {
  url: string;
  data?: T;
  handleRaw?: boolean;
  timeout?: number;
  cancelToken?: AbortController;
  retry?: number;
}
```

用于定义 HTTP 请求的配置选项。

**字段说明**:

- `url`: 请求 URL（必填）
- `data`: 请求数据，GET 请求作为 params，其他作为 body（可选）
- `handleRaw`: 是否返回原始响应，不解析 code（可选，默认 false）
- `timeout`: 超时时间，单位毫秒（可选，默认 5000）
- `cancelToken`: 取消令牌，用于取消请求（可选）
- `retry`: 重试次数（可选，默认 0）

### IResponse - 响应数据

```typescript
interface IResponse<T = unknown> {
  code: number;
  data: T;
  message: string;
}
```

用于定义 HTTP 响应的数据结构。

**字段说明**:

- `code`: 业务状态码，0 表示成功，非 0 表示业务错误
- `data`: 响应数据
- `message`: 响应消息

### IErrorMessage - 错误消息

```typescript
interface IErrorMessage {
  message: string;
  description: string;
  action?: () => void;
}
```

用于定义错误消息的结构。

**字段说明**:

- `message`: 错误标题
- `description`: 错误描述
- `action`: 错误处理动作（可选）

---

## 使用示例

### 示例 1: 使用 IRequestConfig

```typescript
import type { IRequestConfig } from "@/types/baseRequest";

const config: IRequestConfig<{ id: number }> = {
  url: "/api/user",
  data: { id: 1 },
  timeout: 10000,
  retry: 3,
};
```

### 示例 2: 使用 IResponse

```typescript
import type { IResponse } from "@/types/baseRequest";

interface IUser {
  id: number;
  name: string;
  email: string;
}

const response: IResponse<IUser> = {
  code: 0,
  data: {
    id: 1,
    name: "张三",
    email: "zhangsan@example.com",
  },
  message: "成功",
};
```

### 示例 3: 使用 IMenuItem

```typescript
import type { IMenuItem } from "@/types/baseRequest";

const menuItems: IMenuItem[] = [
  {
    id: "1",
    key: "/",
    title: "首页",
    label: "首页",
    code: "home",
    path: "/",
    sortOrder: 1,
  },
  {
    id: "2",
    key: "/users",
    title: "用户管理",
    label: "用户管理",
    code: "users",
    path: "/users",
    sortOrder: 2,
    children: [
      {
        id: "2-1",
        key: "/users/list",
        title: "用户列表",
        label: "用户列表",
        code: "users-list",
        path: "/users/list",
        sortOrder: 1,
      },
    ],
  },
];
```

### 示例 4: 在请求函数中使用

```typescript
import { get } from "@/utils/request";
import type { IRequestConfig, IResponse } from "@/types/baseRequest";

interface IUserParams {
  id: number;
}

interface IUser {
  id: number;
  name: string;
}

async function fetchUser(id: number) {
  const config: IRequestConfig<IUserParams> = {
    url: "/api/user",
    data: { id },
  };

  const user = await get<IUserParams, IUser>(config);
  return user;
}
```

---

## 相关文档

- [request](../utils/request.md) - HTTP 请求工具
- [useTableRequest](../hooks/useTableRequest.md) - 表格请求 Hook
