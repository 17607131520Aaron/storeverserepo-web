declare module "react-virtualized" {
  // 使用最小声明避免在组件中出现 any 报错
  import * as React from "react";

  export interface IListRowProps {
    index: number;
    key: string;
    style: React.CSSProperties;
    isScrolling?: boolean;
    isVisible?: boolean;
    // react-virtualized 源码这里类型较复杂，简化为 unknown 以满足本项目规范
    parent?: unknown;
  }

  export interface IListProps {
    width: number;
    height: number;
    rowCount: number;
    rowHeight: number;
    overscanRowCount?: number;
    rowRenderer: (props: IListRowProps) => React.ReactElement;
  }

  export class List extends React.Component<IListProps> {}

  export interface IAutoSizerProps {
    disableHeight?: boolean;
    children: (size: { width: number; height: number }) => React.ReactNode;
  }

  export class AutoSizer extends React.Component<IAutoSizerProps> {}
}
