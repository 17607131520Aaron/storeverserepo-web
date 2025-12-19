## IndexedDB 本地存储工具使用说明

路径：`src/utils/indexedDBStorage.ts`
用途：在浏览器 IndexedDB 中存储/读取项目相关信息（键值对 + 任意 JSON）

### 数据库信息

- 数据库：`storeverse-app`
- 表（object store）：`project_info`，`keyPath="key"`
- 记录结构：`{ key: string; value: unknown; updatedAt: number }`

### 可用方法

- `saveProjectInfo(key: string, value: unknown): Promise<void>`
  - 保存或更新数据；自动附带更新时间戳。
- `getProjectInfo<T = unknown>(key: string): Promise<T | null>`
  - 按 key 读取，读取失败或不存在返回 `null`。
- `getAllProjectInfo(): Promise<IProjectInfoRecord[]>`
  - 读取全部记录（体量大时注意前端内存）。
- `deleteProjectInfo(key: string): Promise<void>`
  - 删除指定 key。
- `clearProjectInfo(): Promise<void>`
  - 清空表内全部记录。

### 快速示例

```ts
import { saveProjectInfo, getProjectInfo, getAllProjectInfo, deleteProjectInfo } from "@/utils/indexedDBStorage";

// 写入/更新
await saveProjectInfo("user-profile", { id: 1, name: "张三", roles: ["admin"] });

// 读取单条
const profile = await getProjectInfo<{ id: number; name: string }>("user-profile");

// 读取全部
const all = await getAllProjectInfo();

// 删除单条
await deleteProjectInfo("user-profile");
```

### 注意事项

- 仅在浏览器环境可用；若 IndexedDB 不可用（隐私模式等），内部会捕获错误并输出控制台警告，调用方无需额外处理。
- 没有事务性多表/查询能力，更适合轻量缓存、配置或最近记录，复杂关系型需求仍需后端数据库。
