import React from "react";

import { Table, Typography } from "antd";

const { Title } = Typography;

interface IDocumentRecord {
  id: number;
  name: string;
  type: string;
  owner: string;
  updatedAt: string;
}

const columns = [
  {
    title: "ID",
    dataIndex: "id",
    width: 80,
  },
  {
    title: "文档名称",
    dataIndex: "name",
    width: 200,
  },
  {
    title: "类型",
    dataIndex: "type",
    width: 120,
  },
  {
    title: "拥有者",
    dataIndex: "owner",
    width: 150,
  },
  {
    title: "最后更新时间",
    dataIndex: "updatedAt",
  },
];

const mockData: IDocumentRecord[] = Array.from({ length: 1000 }).map((_item, index) => ({
  id: index + 1,
  name: `已删除文档-${index + 1}`,
  type: index % 3 === 0 ? "PDF" : index % 3 === 1 ? "Word" : "图片",
  owner: `用户-${(index % 10) + 1}`,
  updatedAt: `2025-01-${((index % 30) + 1).toString().padStart(2, "0")} 12:00`,
}));

const DocumentsTrash: React.FC = () => {
  return (
    <div style={{ padding: "24px 0" }}>
      <Title level={2} style={{ marginBottom: 24, color: "#1f2937", fontWeight: 600 }}>
        回收站(基础表格渲染1000条数据)
      </Title>

      <div
        style={{
          padding: "16px 16px 24px",
          background: "#fff",
          borderRadius: "12px",
          minHeight: "400px",
        }}
      >
        <Table<IDocumentRecord>
          columns={columns}
          dataSource={mockData}
          pagination={false}
          rowKey="id"
        />
      </div>
    </div>
  );
};

export default DocumentsTrash;
