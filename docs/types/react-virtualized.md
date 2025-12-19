# react-virtualized 虚拟滚动类型定义

**路径**: `src/types/react-virtualized.d.ts`

定义 `react-virtualized` 库的 TypeScript 类型声明。

## 概述

`react-virtualized.d.ts` 提供了 `react-virtualized` 库的 TypeScript 类型声明，使开发者可以在 TypeScript 项目中使用该库并获得类型支持。

---

## 使用示例

### 基本用法

```tsx
import { List, AutoSizer } from "react-virtualized";
import type { IListRowProps } from "react-virtualized";

const rowRenderer = (props: IListRowProps) => {
  const { index, key, style } = props;
  return (
    <div key={key} style={style}>
      Row {index}
    </div>
  );
};

function VirtualList() {
  return (
    <AutoSizer>
      {({ height, width }) => (
        <List
          height={height}
          width={width}
          rowCount={1000}
          rowHeight={50}
          rowRenderer={rowRenderer}
        />
      )}
    </AutoSizer>
  );
}
```

### IListRowProps 接口

```typescript
interface IListRowProps {
  index: number; // 行索引
  key: string; // React key
  style: React.CSSProperties; // 行样式
  // ... 其他属性
}
```

---

## 相关文档

- [react-virtualized](https://github.com/bvaughn/react-virtualized) - react-virtualized 官方文档
- [VirtualTable](../components/VirtualTable.md) - 虚拟表格组件（基于 react-virtualized）
