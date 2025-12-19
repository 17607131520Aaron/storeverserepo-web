# StorageValue 本地存储工具

**路径**: `src/utils/StorageValue.ts`

封装了 localStorage、sessionStorage 和 Cookie 的操作方法。

## 概述

`StorageValue` 工具提供了对浏览器本地存储的统一封装，包括 localStorage、sessionStorage 和 Cookie 的操作方法。它自动处理 JSON 序列化和反序列化，支持存储字符串和对象。

### 特性

- ✅ 自动 JSON 序列化/反序列化（对象类型）
- ✅ 类型安全（TypeScript 支持）
- ✅ 统一的 API 设计
- ✅ 支持 localStorage、sessionStorage 和 Cookie

---

## 安装和导入

### 前置依赖

确保已安装 `js-cookie`：

```bash
pnpm add js-cookie
```

### 导入方式

```typescript
import {
  setLocalStorage,
  getLocalStorage,
  removeLocalStorage,
  clearLocalStorage,
  setSessionStorage,
  getSessionStorage,
  removeSessionStorage,
  clearSessionStorage,
  setCookie,
  getCookie,
  removeCookie,
} from "@/utils/StorageValue";
```

---

## 基本用法

### localStorage 操作

```tsx
import { setLocalStorage, getLocalStorage, removeLocalStorage, clearLocalStorage } from "@/utils/StorageValue";

// 存储字符串
setLocalStorage("username", "张三");

// 存储对象（自动 JSON 序列化）
setLocalStorage("user", { id: 1, name: "张三", email: "zhangsan@example.com" });

// 获取值（自动 JSON 反序列化）
const username = getLocalStorage("username"); // "张三"
const user = getLocalStorage<{ id: number; name: string }>("user"); // { id: 1, name: "张三" }

// 删除值
removeLocalStorage("username");

// 清空全部
clearLocalStorage();
```

### sessionStorage 操作

```tsx
import { setSessionStorage, getSessionStorage, removeSessionStorage, clearSessionStorage } from "@/utils/StorageValue";

// API 与 localStorage 相同
setSessionStorage("tempData", { value: "临时数据" });
const tempData = getSessionStorage<{ value: string }>("tempData");
removeSessionStorage("tempData");
clearSessionStorage();
```

### Cookie 操作

```tsx
import { setCookie, getCookie, removeCookie } from "@/utils/StorageValue";

// 设置 Cookie（7 天后过期）
setCookie({
  key: "token",
  value: "abc123",
  options: { expires: 7 },
});

// 获取 Cookie
const token = getCookie("token");

// 删除 Cookie
removeCookie("token");
```

---

## API 参考

### localStorage / sessionStorage

#### setLocalStorage / setSessionStorage

```typescript
setLocalStorage(key: string, value: string | Record<string, unknown> | null): void;
setSessionStorage(key: string, value: string | Record<string, unknown> | null): void;
```

设置存储值。如果值是对象，会自动 JSON 序列化。

#### getLocalStorage / getSessionStorage

```typescript
getLocalStorage<T = unknown>(key: string): T | null;
getSessionStorage<T = unknown>(key: string): T | null;
```

获取存储值。如果值是 JSON 字符串，会自动反序列化为对象。

#### removeLocalStorage / removeSessionStorage

```typescript
removeLocalStorage(key: string): void;
removeSessionStorage(key: string): void;
```

删除指定键的值。

#### clearLocalStorage / clearSessionStorage

```typescript
clearLocalStorage(): void;
clearSessionStorage(): void;
```

清空所有存储的值。

### Cookie

#### setCookie

```typescript
setCookie({ key: string, value: string, options: Cookies.CookieAttributes }): void;
```

设置 Cookie。`options` 支持所有 `js-cookie` 的选项。

#### getCookie

```typescript
getCookie(key: string): string | undefined;
```

获取 Cookie 值。

#### removeCookie

```typescript
removeCookie(key: string): void;
```

删除 Cookie。

---

## 功能说明

### 自动 JSON 处理

当存储对象时，会自动 JSON 序列化：

```tsx
setLocalStorage("user", { id: 1, name: "张三" });
// 实际存储: '{"id":1,"name":"张三"}'
```

当获取值时，会自动检测并反序列化 JSON：

```tsx
const user = getLocalStorage("user");
// 自动反序列化为: { id: 1, name: "张三" }
```

### 类型安全

使用 TypeScript 泛型指定返回类型：

```tsx
interface IUser {
  id: number;
  name: string;
}

const user = getLocalStorage<IUser>("user");
// user 的类型是 IUser | null
```

---

## 完整示例

### 示例 1: 用户信息存储

```tsx
import { setLocalStorage, getLocalStorage, removeLocalStorage } from "@/utils/StorageValue";

interface IUser {
  id: number;
  name: string;
  email: string;
}

// 保存用户信息
function saveUser(user: IUser) {
  setLocalStorage("user", user);
}

// 获取用户信息
function getUser(): IUser | null {
  return getLocalStorage<IUser>("user");
}

// 清除用户信息
function clearUser() {
  removeLocalStorage("user");
}
```

### 示例 2: 临时数据存储

```tsx
import { setSessionStorage, getSessionStorage } from "@/utils/StorageValue";

// 保存表单草稿（页面关闭后自动清除）
function saveDraft(formData: Record<string, unknown>) {
  setSessionStorage("formDraft", formData);
}

// 恢复表单草稿
function getDraft(): Record<string, unknown> | null {
  return getSessionStorage<Record<string, unknown>>("formDraft");
}
```

### 示例 3: Cookie 认证

```tsx
import { setCookie, getCookie, removeCookie } from "@/utils/StorageValue";

// 保存 token（7 天后过期）
function saveToken(token: string) {
  setCookie({
    key: "token",
    value: token,
    options: {
      expires: 7, // 7 天后过期
      secure: true, // 仅在 HTTPS 下传输
      sameSite: "strict", // 防止 CSRF
    },
  });
}

// 获取 token
function getToken(): string | undefined {
  return getCookie("token");
}

// 清除 token
function clearToken() {
  removeCookie("token");
}
```

### 示例 4: 主题设置

```tsx
import { setLocalStorage, getLocalStorage } from "@/utils/StorageValue";

type Theme = "light" | "dark";

function saveTheme(theme: Theme) {
  setLocalStorage("theme", theme);
}

function getTheme(): Theme {
  return (getLocalStorage<Theme>("theme") || "light") as Theme;
}
```

### 示例 5: 购物车数据

```tsx
import { setLocalStorage, getLocalStorage } from "@/utils/StorageValue";

interface ICartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

function saveCart(items: ICartItem[]) {
  setLocalStorage("cart", items);
}

function getCart(): ICartItem[] {
  return getLocalStorage<ICartItem[]>("cart") || [];
}
```

---

## 最佳实践

### 1. 使用 TypeScript 类型

充分利用 TypeScript 类型推断：

```tsx
// ✅ 好的做法：指定类型
interface IUser {
  id: number;
  name: string;
}
const user = getLocalStorage<IUser>("user");

// ❌ 不好的做法：不指定类型
const user = getLocalStorage("user");
```

### 2. 处理 null 值

存储的值可能为 `null`，需要处理：

```tsx
const user = getLocalStorage<IUser>("user");
if (user) {
  // 使用 user
} else {
  // 处理 null 情况
}
```

### 3. 选择合适的存储方式

- **localStorage**: 持久化数据，需要跨会话保存
- **sessionStorage**: 临时数据，页面关闭后清除
- **Cookie**: 需要发送到服务器的数据（如认证 token）

### 4. 避免存储敏感信息

不要在 localStorage 或 sessionStorage 中存储敏感信息（如密码、token），考虑使用 Cookie 或 IndexedDB。

---

## 注意事项

1. **存储限制**: localStorage 和 sessionStorage 有大小限制（通常 5-10MB）
2. **同步操作**: 所有操作都是同步的，可能阻塞主线程
3. **隐私模式**: 某些浏览器的隐私模式可能限制存储
4. **JSON 解析**: 如果存储的不是有效 JSON，会返回原始字符串

---

## 相关文档

- [indexedDBStorage](./indexedDBStorage.md) - IndexedDB 存储工具（适合大量数据）
- [useAuth](../hooks/useAuth.md) - 认证管理 Hook（使用 IndexedDB 存储认证信息）
