# useAuth 认证管理 Hook

**路径**: `src/hooks/useAuth/useAuth.ts`

管理用户认证状态的 Hook，支持 token 和用户信息的持久化存储。

## 概述

`useAuth` 是一个用于管理用户认证状态的 React Hook。它提供了登录、退出登录、token 管理等功能，并自动将认证信息持久化到 IndexedDB。

### 特性

- ✅ 自动从 IndexedDB 恢复登录状态
- ✅ 自动检测 token 过期
- ✅ 持久化存储认证信息
- ✅ TypeScript 类型支持
- ✅ 加载状态管理

---

## 安装和导入

### 前置依赖

需要依赖 `indexedDBStorage` 工具：

```typescript
import { getProjectInfo, saveProjectInfo, deleteProjectInfo } from "@/utils/indexedDBStorage";
```

### 导入方式

```typescript
import useAuth from "@/hooks/useAuth";
import type { IAuthUser, IAuthState } from "@/hooks/useAuth";
```

---

## 基本用法

### 简单使用

```tsx
import useAuth from "@/hooks/useAuth";

function LoginPage() {
  const { login, logout, isAuthenticated, token, user, loading } = useAuth();

  const handleLogin = async () => {
    // 调用登录 API
    const response = await loginAPI({ username, password });

    // 保存认证信息
    await login(response.token, response.user, response.expiresAt);
  };

  if (loading) {
    return <div>加载中...</div>;
  }

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>欢迎, {user?.name}</p>
          <button onClick={logout}>退出登录</button>
        </div>
      ) : (
        <LoginForm onLogin={handleLogin} />
      )}
    </div>
  );
}
```

---

## API 参考

### 返回值

| 属性              | 类型                                                                            | 说明                             |
| ----------------- | ------------------------------------------------------------------------------- | -------------------------------- |
| `token`           | `string \| null`                                                                | 访问令牌                         |
| `user`            | `IAuthUser \| null`                                                             | 用户信息                         |
| `expiresAt`       | `number \| null`                                                                | token 过期时间（时间戳，毫秒）   |
| `loading`         | `boolean`                                                                       | 是否正在加载认证状态             |
| `isAuthenticated` | `boolean`                                                                       | 是否已认证（token 存在且未过期） |
| `tokenExpired`    | `boolean`                                                                       | token 是否已过期                 |
| `login`           | `(token: string, user: IAuthUser, expiresAt?: number \| null) => Promise<void>` | 登录方法                         |
| `logout`          | `() => Promise<void>`                                                           | 退出登录方法                     |

### 类型定义

```typescript
interface IAuthUser {
  [key: string]: unknown; // 根据实际业务扩展字段
}

interface IAuthState {
  token: string | null;
  user: IAuthUser | null;
  expiresAt: number | null; // token 过期时间（时间戳，毫秒）
}
```

---

## 功能说明

### 登录状态恢复

`useAuth` 在初始化时会自动从 IndexedDB 中恢复登录状态：

1. 读取存储的认证信息
2. 检查 token 是否过期
3. 如果过期，自动清理本地状态
4. 如果有效，恢复认证状态

### Token 过期检测

- 如果 `expiresAt` 为 `null`，表示 token 不过期或由后端控制
- 如果 `expiresAt` 有值，会自动检测是否过期
- 过期时会自动清理本地状态

### 数据存储

认证信息存储在 IndexedDB 中，存储键为 `auth_info`。

---

## 完整示例

### 示例 1: 登录页面

```tsx
import { useState } from "react";
import useAuth from "@/hooks/useAuth";
import { post } from "@/utils/request";

function LoginPage() {
  const { login, loading } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await post<
        { username: string; password: string },
        {
          token: string;
          user: { id: number; name: string; email: string };
          expiresAt: number;
        }
      >({
        url: "/api/login",
        data: { username, password },
      });

      // 保存认证信息（7 天后过期）
      const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
      await login(response.token, response.user, expiresAt);

      // 跳转到首页
      window.location.href = "/";
    } catch (error) {
      console.error("登录失败:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="用户名" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="密码" />
      <button type="submit" disabled={loading}>
        登录
      </button>
    </form>
  );
}
```

### 示例 2: 受保护的路由

```tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";

function ProtectedPage() {
  const { isAuthenticated, loading, tokenExpired, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // 未登录，跳转到登录页
      navigate("/login");
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    if (tokenExpired) {
      // token 过期，退出登录
      logout();
      navigate("/login");
    }
  }, [tokenExpired, logout, navigate]);

  if (loading) {
    return <div>加载中...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <div>受保护的内容</div>;
}
```

### 示例 3: 用户信息显示

```tsx
import useAuth from "@/hooks/useAuth";

interface IUser {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

function UserProfile() {
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <div>请先登录</div>;
  }

  const userInfo = user as IUser;

  return (
    <div>
      {userInfo.avatar && <img src={userInfo.avatar} alt="头像" />}
      <h2>{userInfo.name}</h2>
      <p>{userInfo.email}</p>
      <button onClick={logout}>退出登录</button>
    </div>
  );
}
```

### 示例 4: 请求拦截器中使用

```tsx
// 在 request.ts 中使用
import useAuth from "@/hooks/useAuth";

// 注意：不能在 request.ts 中直接使用 Hook
// 需要在组件中获取 token，然后传递给请求

function MyComponent() {
  const { token } = useAuth();

  useEffect(() => {
    // 设置请求拦截器
    if (token) {
      // 在请求头中添加 token
      // 这通常在 request.ts 的拦截器中处理
    }
  }, [token]);
}
```

---

## 最佳实践

### 1. 检查加载状态

在使用认证状态前，先检查 `loading` 状态：

```tsx
const { isAuthenticated, loading } = useAuth();

if (loading) {
  return <Loading />;
}

if (!isAuthenticated) {
  return <LoginPage />;
}
```

### 2. Token 过期处理

监听 `tokenExpired` 状态，自动处理过期情况：

```tsx
useEffect(() => {
  if (tokenExpired) {
    logout();
    // 跳转到登录页或显示过期提示
  }
}, [tokenExpired, logout]);
```

### 3. 扩展用户信息类型

根据实际业务扩展 `IAuthUser` 类型：

```tsx
interface IUser {
  id: number;
  name: string;
  email: string;
  roles: string[];
  permissions: string[];
}

// 使用时进行类型断言
const user = user as IUser;
```

### 4. 登录时设置过期时间

根据后端返回的过期时间设置：

```tsx
// 如果后端返回过期时间（秒）
const expiresAt = response.expiresIn ? Date.now() + response.expiresIn * 1000 : null;

await login(response.token, response.user, expiresAt);
```

---

## 注意事项

1. **存储位置**: 认证信息存储在 IndexedDB，不是 localStorage
2. **Token 格式**: token 应该是字符串格式
3. **过期时间**: `expiresAt` 应该是毫秒时间戳
4. **用户信息**: `user` 可以是任意对象，根据业务需求扩展

---

## 相关文档

- [indexedDBStorage](../utils/indexedDBStorage.md) - IndexedDB 存储工具
- [request](../utils/request.md) - HTTP 请求工具
