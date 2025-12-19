# Zustand Store 配置说明

## 概述

本项目使用 Zustand 作为状态管理库，并配置了持久化功能。只有配置名单中的命名空间才会被持久化到 localStorage。

## 命名规范

**命名空间格式：`模块名/功能名`**

- 使用小写字母和斜杠
- 格式：`{模块名}/{功能名}`
- 示例：
  - `user/profile` - 用户模块的个人资料
  - `user/preferences` - 用户模块的偏好设置
  - `settings/basic` - 设置模块的基础设置
  - `settings/security` - 设置模块的安全设置
  - `app/theme` - 应用模块的主题设置

## 文件结构

- `config.ts` - 持久化配置名单和工具函数
- `createPersistStore.ts` - 创建支持持久化的 store 工厂函数
- `index.ts` - 统一导出入口

## 使用方法

### 1. 创建 Store

使用 `createPersistStore` 创建 store：

```typescript
import { createPersistStore } from "@/store";

interface UserState {
  name: string;
  email: string;
  setName: (name: string) => void;
  setEmail: (email: string) => void;
}

const useUserStore = createPersistStore<UserState>(
  "user/profile", // 命名空间：模块名/功能名
  (set) => ({
    name: "",
    email: "",
    setName: (name) => set({ name }),
    setEmail: (email) => set({ email }),
  }),
);
```

### 2. 配置持久化名单

在 `config.ts` 中的 `PERSIST_NAMESPACES` 数组中添加需要持久化的命名空间：

```typescript
export const PERSIST_NAMESPACES = [
  "user/profile", // 用户模块/个人资料需要持久化
  "settings/basic", // 设置模块/基础设置需要持久化
  // "temp/data",   // 临时状态不需要持久化，不添加到名单中
] as const;
```

### 3. 使用 Store

在组件中使用：

```typescript
import { useUserStore } from "@/store";

function UserProfile() {
  const { name, email, setName, setEmail } = useUserStore();

  return (
    <div>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
    </div>
  );
}
```

## 持久化机制

- **持久化存储位置**: localStorage
- **存储 key 格式**: `zustand-store:{namespace}`
- **持久化条件**: 只有 `PERSIST_NAMESPACES` 中配置的命名空间才会被持久化
- **未配置的命名空间**: 不会持久化，页面刷新后状态会重置

## 高级配置

### 自定义持久化选项

```typescript
import { createPersistStore } from "@/store";

const useUserStore = createPersistStore<UserState>(
  "user/profile", // 命名空间：模块名/功能名
  (set) => ({
    /* ... */
  }),
  {
    // 只持久化部分字段
    partialize: (state) => ({ name: state.name }),
    // 版本号，用于数据迁移
    version: 1,
  },
);
```

### 检查命名空间是否需要持久化

```typescript
import { shouldPersist } from "@/store";

if (shouldPersist("user/profile")) {
  console.log("user/profile store 会被持久化");
}
```

## 注意事项

1. **命名空间格式**：必须遵循 `模块名/功能名` 的格式（例如：`user/profile`、`settings/basic`）
2. **命名空间唯一性**：命名空间必须唯一，建议使用有意义的名称
3. **持久化配置**：只有添加到 `PERSIST_NAMESPACES` 的命名空间才会持久化
4. **存储限制**：持久化数据存储在 localStorage，注意数据大小限制（通常 5-10MB）
5. **安全性**：敏感信息不建议持久化，或使用加密存储
