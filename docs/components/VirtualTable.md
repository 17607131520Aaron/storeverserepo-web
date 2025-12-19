# VirtualTable 虚拟表格组件

**路径**: `src/components/VirtualTable/index.tsx`

基于 `react-virtualized` 的虚拟滚动表格组件，适用于渲染大量数据（万级以上）。

## 概述

`VirtualTable` 是一个高性能的虚拟滚动表格组件，使用 `react-virtualized` 实现。它只渲染可见区域的行，因此可以高效地处理大量数据（10万+条记录）。

### 特性

- ✅ 虚拟滚动，支持渲染大量数据（10万+）
- ✅ 自动列宽计算
- ✅ 支持自定义列渲染
- ✅ 支持行点击事件
- ✅ 加载状态显示
- ✅ 空数据状态显示
- ✅ TypeScript 类型支持

---

## 安装和导入

### 前置依赖

确保已安装 `react-virtualized` 和 `antd`：

```bash
pnpm add react-virtualized antd
```

### 导入方式

```typescript
import VirtualTableComponent from "@/components/VirtualTable";
import type { IVirtualColumn } from "@/components/VirtualTable";
```

---

## 基本用法

### 简单使用

```tsx
import VirtualTableComponent from "@/components/VirtualTable";
import type { IVirtualColumn } from "@/components/VirtualTable";

interface IRecord {
  id: number;
  name: string;
  age: number;
}

const columns: IVirtualColumn<IRecord>[] = [
  { title: "ID", dataIndex: "id", width: 80 },
  { title: "姓名", dataIndex: "name", width: 200 },
  { title: "年龄", dataIndex: "age", width: 100 },
];

function TablePage() {
  const data: IRecord[] = [
    { id: 1, name: "张三", age: 25 },
    { id: 2, name: "李四", age: 30 },
    // ... 更多数据
  ];

  return (
    <VirtualTableComponent<IRecord>
      columns={columns}
      dataSource={data}
      height={600}
      rowHeight={44}
      rowKey="id"
    />
  );
}
```

---

## API 参考

### Props

| 属性           | 类型                                          | 必填 | 默认值            | 说明           |
| -------------- | --------------------------------------------- | ---- | ----------------- | -------------- |
| `columns`      | `IVirtualColumn<RecordType>[]`                | ✅   | -                 | 表格列配置     |
| `dataSource`   | `RecordType[]`                                | ✅   | -                 | 数据源         |
| `rowKey`       | `string \| ((record, index) => React.Key)`    | ❌   | `index`           | 行的唯一标识   |
| `className`    | `string`                                      | ❌   | -                 | 自定义类名     |
| `loading`      | `boolean`                                     | ❌   | `false`           | 加载状态       |
| `loadingText`  | `ReactNode`                                   | ❌   | `"数据加载中..."` | 加载提示文字   |
| `height`       | `number`                                      | ❌   | `400`             | 表格高度（px） |
| `rowHeight`    | `number`                                      | ❌   | `40`              | 行高（px）     |
| `headerHeight` | `number`                                      | ❌   | `40`              | 表头高度（px） |
| `onRowClick`   | `(record: RecordType, index: number) => void` | ❌   | -                 | 行点击回调     |

### IVirtualColumn 接口

```typescript
interface IVirtualColumn<RecordType> {
  title: ReactNode; // 列标题
  dataIndex?: keyof RecordType | string; // 数据字段名
  key?: string; // 列的唯一标识
  width?: number; // 列宽度（px）
  render?: (value: unknown, record: RecordType, index: number) => ReactNode; // 自定义渲染
}
```

---

## 功能说明

### 虚拟滚动原理

`VirtualTable` 使用虚拟滚动技术，只渲染可见区域的行。当滚动时，动态创建和销毁行元素，从而保持高性能。

### 列宽计算

- 如果所有列都指定了 `width`，则按比例分配
- 如果部分列指定了 `width`，指定宽度的列按固定宽度，其余列平均分配
- 如果所有列都没有指定 `width`，则平均分配

### 状态显示

- **加载状态**: 当 `loading` 为 `true` 时显示加载动画
- **空数据状态**: 当 `dataSource` 为空且不在加载时显示"暂无数据"

---

## 完整示例

### 示例 1: 基础表格

```tsx
import VirtualTableComponent from "@/components/VirtualTable";
import type { IVirtualColumn } from "@/components/VirtualTable";

interface IUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

const columns: IVirtualColumn<IUser>[] = [
  {
    title: "ID",
    dataIndex: "id",
    width: 80,
  },
  {
    title: "姓名",
    dataIndex: "name",
    width: 200,
  },
  {
    title: "邮箱",
    dataIndex: "email",
    width: 250,
  },
  {
    title: "角色",
    dataIndex: "role",
    width: 150,
  },
];

function UserTable() {
  const [data, setData] = useState<IUser[]>([]);

  return (
    <VirtualTableComponent<IUser>
      columns={columns}
      dataSource={data}
      height={600}
      rowHeight={44}
      rowKey="id"
    />
  );
}
```

### 示例 2: 自定义列渲染

```tsx
const columns: IVirtualColumn<IUser>[] = [
  {
    title: "ID",
    dataIndex: "id",
    width: 80,
  },
  {
    title: "姓名",
    dataIndex: "name",
    width: 200,
  },
  {
    title: "角色",
    dataIndex: "role",
    width: 150,
    render: (value) => <span style={{ color: value === "admin" ? "red" : "blue" }}>{value}</span>,
  },
  {
    title: "操作",
    key: "action",
    width: 150,
    render: (_, record) => (
      <div>
        <button onClick={() => handleEdit(record)}>编辑</button>
        <button onClick={() => handleDelete(record)}>删除</button>
      </div>
    ),
  },
];
```

### 示例 3: 带加载状态和行点击

```tsx
function UserTable() {
  const [data, setData] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(false);

  const handleRowClick = (record: IUser, index: number) => {
    console.log("点击了行:", record, "索引:", index);
  };

  return (
    <VirtualTableComponent<IUser>
      columns={columns}
      dataSource={data}
      height={600}
      rowHeight={44}
      loading={loading}
      loadingText="正在加载用户列表..."
      rowKey="id"
      onRowClick={handleRowClick}
    />
  );
}
```

### 示例 4: 大量数据渲染

```tsx
function LargeDataTable() {
  // 生成 10 万条数据
  const data = Array.from({ length: 100000 }, (_, index) => ({
    id: index + 1,
    name: `用户 ${index + 1}`,
    email: `user${index + 1}@example.com`,
    role: index % 2 === 0 ? "admin" : "user",
  }));

  return (
    <VirtualTableComponent<IUser>
      columns={columns}
      dataSource={data}
      height={600}
      rowHeight={44}
      rowKey="id"
    />
  );
}
```

### 示例 5: 与 useTableRequest 配合使用

```tsx
import { useTableRequest } from "@/hooks/useTableRequest";
import { get } from "@/utils/request";
import VirtualTableComponent from "@/components/VirtualTable";

function UserListPage() {
  const { data, loading } = useTableRequest({
    requestFn: async (params) => {
      return get({ url: "/api/users", data: params });
    },
    params: { page: 1, pageSize: 100 },
  });

  return (
    <VirtualTableComponent<IUser>
      columns={columns}
      dataSource={data || []}
      height={600}
      rowHeight={44}
      loading={loading}
      rowKey="id"
    />
  );
}
```

---

## 最佳实践

### 1. 设置合适的行高

根据内容设置合适的 `rowHeight`，避免内容被截断：

```tsx
<VirtualTableComponent
  rowHeight={60} // 如果内容较多，增加行高
  // ...
/>
```

### 2. 使用 rowKey

始终提供 `rowKey`，有助于 React 优化渲染：

```tsx
<VirtualTableComponent
  rowKey="id" // 使用唯一标识
  // 或
  rowKey={(record, index) => record.id}
  // ...
/>
```

### 3. 列宽设置

为重要列设置固定宽度，确保显示效果：

```tsx
const columns: IVirtualColumn<IRecord>[] = [
  { title: "ID", dataIndex: "id", width: 80 }, // 固定宽度
  { title: "名称", dataIndex: "name", width: 200 }, // 固定宽度
  { title: "描述", dataIndex: "description" }, // 自适应宽度
];
```

### 4. 性能优化

- 避免在 `render` 函数中进行复杂计算
- 使用 `useMemo` 缓存列配置
- 大量数据时考虑分页或虚拟滚动

---

## 注意事项

1. **数据量**: 虽然支持大量数据，但建议不超过 100 万条
2. **行高固定**: 当前实现要求所有行高度相同
3. **列宽**: 列宽计算基于容器宽度，确保容器有明确宽度
4. **浏览器兼容性**: 需要浏览器支持现代 CSS 特性（flexbox）

---

## 相关文档

- [react-virtualized](https://github.com/bvaughn/react-virtualized) - react-virtualized 官方文档
- [useTableRequest](../hooks/useTableRequest.md) - 表格请求 Hook
