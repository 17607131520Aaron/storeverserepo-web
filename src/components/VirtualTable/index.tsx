import React, { useMemo, type ReactElement, type ReactNode } from "react";

import { AutoSizer, List, type IListRowProps } from "react-virtualized";
import "antd/dist/reset.css";
import "./index.scss";

export interface IVirtualColumn<RecordType> {
  title: ReactNode;
  dataIndex?: keyof RecordType | string;
  key?: string;
  width?: number;
  render?: (value: unknown, record: RecordType, index: number) => ReactNode;
}

export interface IVirtualTableProps<RecordType> {
  columns: IVirtualColumn<RecordType>[];
  dataSource: RecordType[];
  rowKey?: string | ((record: RecordType, index: number) => React.Key);
  className?: string;
  height?: number;
  rowHeight?: number;
  headerHeight?: number;
  onRowClick?: (record: RecordType, index: number) => void;
}

function getRowKey<RecordType>(
  record: RecordType,
  index: number,
  rowKey?: string | ((record: RecordType, index: number) => React.Key),
): React.Key {
  if (typeof rowKey === "function") {
    return rowKey(record, index);
  }

  if (typeof rowKey === "string" && record) {
    const value = (record as Record<string, unknown>)[rowKey];
    if (value !== null && value !== undefined) {
      return value as React.Key;
    }
  }

  return index;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export function VirtualTableComponent<RecordType>({
  columns,
  dataSource,
  rowKey,
  className,
  height = 400,
  rowHeight = 40,
  headerHeight = 40,
  onRowClick,
}: IVirtualTableProps<RecordType>): ReactElement {
  const { totalWidth, columnWidths } = useMemo(() => {
    const explicitWidths = columns.map((c) => c.width || 0);
    const totalExplicit = explicitWidths.reduce((sum, w) => sum + w, 0);

    const fallbackWidth = totalExplicit === 0 ? 1 / Math.max(columns.length, 1) : undefined;

    const widths = columns.map((col, _index) => {
      if (col.width && totalExplicit > 0) {
        return col.width / totalExplicit;
      }
      if (fallbackWidth !== undefined) {
        return fallbackWidth;
      }
      return 1 / Math.max(columns.length, 1);
    });

    return {
      totalWidth: 1,
      columnWidths: widths,
    };
  }, [columns]);

  const renderCell = (
    col: IVirtualColumn<RecordType>,
    record: RecordType,
    index: number,
  ): ReactNode => {
    const value =
      col.dataIndex !== null && col.dataIndex !== undefined
        ? (record[col.dataIndex as keyof RecordType] as unknown)
        : undefined;

    if (col.render) {
      return col.render(value, record, index);
    }

    return value as ReactNode;
  };

  const rowRenderer = (props: IListRowProps): ReactElement => {
    const { index, key, style } = props;
    const rowIndex: number = typeof index === "number" ? index : Number(index);
    const record = dataSource[rowIndex];
    const recordKey = getRowKey(record, rowIndex, rowKey);

    return (
      <div
        key={key}
        className="virtual-table-row ant-table-row"
        data-row-key={recordKey}
        style={style}
        onClick={() => onRowClick?.(record, rowIndex)}
      >
        {columns.map((col, colIndex) => (
          <div
            key={col.key || String(col.dataIndex) || colIndex}
            className="virtual-table-cell ant-table-cell"
            style={{
              flex: `${columnWidths[colIndex]} 0 0`,
              minWidth: 0,
            }}
          >
            {renderCell(col, record, rowIndex)}
          </div>
        ))}
      </div>
    );
  };

  const tableClass = ["virtual-table", "ant-table", className].filter(Boolean).join(" ");

  if (!dataSource.length) {
    return (
      <div className={tableClass}>
        <div className="ant-table-container">
          <div className="virtual-table-header ant-table-header">
            <div className="virtual-table-header-row ant-table-thead">
              {columns.map((col, index) => (
                <div
                  key={col.key || String(col.dataIndex) || index}
                  className="virtual-table-cell virtual-table-header-cell ant-table-cell"
                  style={{
                    flex: `${columnWidths[index]} 0 0`,
                    minWidth: 0,
                  }}
                >
                  {col.title}
                </div>
              ))}
            </div>
          </div>
          <div className="virtual-table-empty">暂无数据</div>
        </div>
      </div>
    );
  }

  return (
    <div className={tableClass}>
      <div className="ant-table-container">
        <div className="virtual-table-header ant-table-header">
          <div
            className="virtual-table-header-row ant-table-thead"
            style={{ height: headerHeight }}
          >
            {columns.map((col, index) => (
              <div
                key={col.key || String(col.dataIndex) || index}
                className="virtual-table-cell virtual-table-header-cell ant-table-cell"
                style={{
                  flex: `${columnWidths[index]} 0 0`,
                  minWidth: 0,
                }}
              >
                {col.title}
              </div>
            ))}
          </div>
        </div>

        <div className="virtual-table-body ant-table-body">
          <AutoSizer disableHeight>
            {({ width }) => (
              <List
                height={height}
                overscanRowCount={10}
                rowCount={dataSource.length}
                rowHeight={rowHeight}
                rowRenderer={rowRenderer}
                width={width * totalWidth}
              />
            )}
          </AutoSizer>
        </div>
      </div>
    </div>
  );
}

export default VirtualTableComponent;
