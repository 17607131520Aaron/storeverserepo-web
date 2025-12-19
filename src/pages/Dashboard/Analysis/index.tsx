import React from "react";

import { Typography } from "antd";

const { Title } = Typography;

const DashboardAnalysis: React.FC = () => {
  return (
    <div style={{ padding: "24px 0" }}>
      <Title
        level={2}
        style={{
          marginBottom: 24,
          color: "#1f2937",
          fontWeight: 600,
        }}
      >
        统计分析
      </Title>
      <div
        style={{
          padding: "40px",
          textAlign: "center",
          background: "#fff",
          borderRadius: "12px",
          minHeight: "400px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Title level={3} style={{ color: "#4b5563", fontWeight: 500 }}>
          统计分析页面
        </Title>
        <p style={{ color: "#6b7280", fontSize: "16px", marginTop: "16px" }}>这里将展示系统的统计分析数据</p>
      </div>
    </div>
  );
};

export default DashboardAnalysis;
