import React, { useMemo } from "react";

import { useNavigate } from "react-router-dom";

import {
  AppstoreOutlined,
  ArrowUpOutlined,
  BarChartOutlined,
  BugOutlined,
  FileTextOutlined,
  RightOutlined,
  SettingOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Card, Col, Row, Statistic, Typography } from "antd";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const { Title, Text } = Typography;

interface IQuickAction {
  bgColor: string;
  color: string;
  description: string;
  icon: React.ReactNode;
  key: string;
  path: string;
  title: string;
}

interface ITooltipProps {
  active?: boolean;
  label?: string;
  payload?: Array<{
    color: string;
    name: string;
    value: number;
  }>;
}

const quickActions: IQuickAction[] = [
  {
    bgColor: "#e6f7ff",
    color: "#1890ff",
    description: "查看系统数据统计和分析",
    icon: <BarChartOutlined />,
    key: "dashboard",
    path: "/dashboard/overview",
    title: "数据概览",
  },
  {
    bgColor: "#f6ffed",
    color: "#52c41a",
    description: "管理文档和分类",
    icon: <FileTextOutlined />,
    key: "documents",
    path: "/documents/list",
    title: "文档管理",
  },
  {
    bgColor: "#f9f0ff",
    color: "#722ed1",
    description: "成员、角色和部门管理",
    icon: <TeamOutlined />,
    key: "team",
    path: "/team/members",
    title: "团队管理",
  },
  {
    bgColor: "#fff7e6",
    color: "#fa8c16",
    description: "生成和管理条码",
    icon: <AppstoreOutlined />,
    key: "barcode",
    path: "/barcode/manage",
    title: "条码生成",
  },
  {
    bgColor: "#e6fffb",
    color: "#13c2c2",
    description: "系统配置和管理",
    icon: <SettingOutlined />,
    key: "settings",
    path: "/settings/basic",
    title: "系统设置",
  },
  {
    bgColor: "#fff0f6",
    color: "#eb2f96",
    description: "服务通APP调试工具",
    icon: <BugOutlined />,
    key: "debug",
    path: "/smartserviceappDebug/debuglogs",
    title: "调试工具",
  },
];

// Mock数据
const mockStats = {
  barcodeGrowth: 23.1,
  documentGrowth: 12.5,
  memberGrowth: 8.3,
  systemUptime: 127,
  todayBarcodes: 156,
  totalDocuments: 1234,
  totalTeamMembers: 48,
};

// 最近7天的数据趋势
const last7DaysData = [
  { 访问: 320, name: "周一", 条码: 45, 文档: 120 },
  { 访问: 380, name: "周二", 条码: 52, 文档: 132 },
  { 访问: 410, name: "周三", 条码: 48, 文档: 145 },
  { 访问: 450, name: "周四", 条码: 61, 文档: 158 },
  { 访问: 420, name: "周五", 条码: 55, 文档: 142 },
  { 访问: 360, name: "周六", 条码: 42, 文档: 128 },
  { 访问: 390, name: "周日", 条码: 58, 文档: 156 },
];

// 文档分类数据（优化配色）
const documentCategoryData = [
  { color: "#1890ff", gradient: ["#1890ff", "#096dd9"], name: "技术文档", value: 420 },
  { color: "#52c41a", gradient: ["#52c41a", "#389e0d"], name: "业务文档", value: 380 },
  { color: "#fa8c16", gradient: ["#fa8c16", "#d46b08"], name: "设计文档", value: 280 },
  { color: "#722ed1", gradient: ["#722ed1", "#531dab"], name: "其他文档", value: 154 },
];

// 部门成员分布数据
const departmentData = [
  { name: "研发部", 成员: 18 },
  { name: "产品部", 成员: 12 },
  { name: "设计部", 成员: 8 },
  { name: "运营部", 成员: 10 },
];

// 自定义 Tooltip 样式
const CustomTooltip = ({ active, label, payload }: ITooltipProps): React.ReactElement | null => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: "#fff",
          border: "1px solid #e8e8e8",
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          padding: "12px 16px",
        }}
      >
        <p style={{ color: "#1f2937", fontWeight: 600, margin: 0, marginBottom: 8 }}>{label}</p>
        {payload.map((item, index) => (
          <p
            key={index}
            style={{
              alignItems: "center",
              color: item.color,
              display: "flex",
              fontSize: 14,
              gap: 8,
              margin: 0,
              marginTop: 4,
            }}
          >
            <span
              style={{
                backgroundColor: item.color,
                borderRadius: "50%",
                display: "inline-block",
                height: 8,
                width: 8,
              }}
            />
            {item.name}: <span style={{ fontWeight: 600 }}>{item.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleQuickActionClick = (path: string): void => {
    navigate(path);
  };

  // 计算文档总数
  const totalDocumentValue = useMemo(() => {
    return documentCategoryData.reduce((sum, item) => sum + item.value, 0);
  }, []);

  return (
    <div style={{ padding: 12 }}>
      {/* 欢迎横幅 */}
      <Card
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          border: "none",
          borderRadius: 12,
          marginBottom: 24,
        }}
        styles={{ body: { padding: "40px 32px" } }}
      >
        <div style={{ color: "#fff" }}>
          <Title
            level={2}
            style={{
              color: "#fff",
              fontWeight: 600,
              marginBottom: 12,
            }}
          >
            欢迎使用管理系统
          </Title>
          <Text style={{ color: "rgba(255, 255, 255, 0.85)", fontSize: 16 }}>
            这里是您的系统首页，您可以快速访问各个功能模块
          </Text>
        </div>
      </Card>

      {/* 数据统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col lg={6} md={12} sm={24} xl={6} xs={24}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              precision={0}
              prefix={<ArrowUpOutlined style={{ fontSize: 16 }} />}
              suffix="个"
              title="文档总数"
              value={mockStats.totalDocuments}
              valueStyle={{ color: "#1890ff", fontSize: 28, fontWeight: 600 }}
            />
            <div style={{ marginTop: 8 }}>
              <Text style={{ fontSize: 12 }} type="secondary">
                较上月增长 {mockStats.documentGrowth}%
              </Text>
            </div>
          </Card>
        </Col>
        <Col lg={6} md={12} sm={24} xl={6} xs={24}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              precision={0}
              prefix={<ArrowUpOutlined style={{ fontSize: 16 }} />}
              suffix="人"
              title="团队成员"
              value={mockStats.totalTeamMembers}
              valueStyle={{ color: "#52c41a", fontSize: 28, fontWeight: 600 }}
            />
            <div style={{ marginTop: 8 }}>
              <Text style={{ fontSize: 12 }} type="secondary">
                较上月增长 {mockStats.memberGrowth}%
              </Text>
            </div>
          </Card>
        </Col>
        <Col lg={6} md={12} sm={24} xl={6} xs={24}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              precision={0}
              prefix={<ArrowUpOutlined style={{ fontSize: 16 }} />}
              suffix="个"
              title="今日生成条码"
              value={mockStats.todayBarcodes}
              valueStyle={{ color: "#fa8c16", fontSize: 28, fontWeight: 600 }}
            />
            <div style={{ marginTop: 8 }}>
              <Text style={{ fontSize: 12 }} type="secondary">
                较昨日增长 {mockStats.barcodeGrowth}%
              </Text>
            </div>
          </Card>
        </Col>
        <Col lg={6} md={12} sm={24} xl={6} xs={24}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              precision={0}
              suffix="天"
              title="系统运行时长"
              value={mockStats.systemUptime}
              valueStyle={{ color: "#722ed1", fontSize: 28, fontWeight: 600 }}
            />
            <div style={{ marginTop: 8 }}>
              <Text style={{ fontSize: 12 }} type="secondary">
                系统运行稳定
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 图表区域 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* 数据趋势图 - 使用面积图+折线图组合 */}
        <Col lg={16} md={24} sm={24} xl={16} xs={24}>
          <Card
            style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)" }}
            styles={{ body: { padding: "24px" } }}
            title={
              <Title level={5} style={{ color: "#1f2937", fontWeight: 600, margin: 0 }}>
                最近7天数据趋势
              </Title>
            }
          >
            <ResponsiveContainer height={320} width="100%">
              <AreaChart data={last7DaysData} margin={{ bottom: 0, left: 0, right: 30, top: 10 }}>
                <defs>
                  <linearGradient id="color文档" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#1890ff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#1890ff" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="color条码" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#52c41a" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#52c41a" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="color访问" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#fa8c16" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#fa8c16" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#f0f0f0" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  axisLine={{ stroke: "#e8e8e8" }}
                  dataKey="name"
                  stroke="#8c8c8c"
                  tick={{ fill: "#8c8c8c", fontSize: 12 }}
                />
                <YAxis axisLine={{ stroke: "#e8e8e8" }} stroke="#8c8c8c" tick={{ fill: "#8c8c8c", fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(value) => <span style={{ color: "#595959", fontSize: 12 }}>{value}</span>}
                  iconType="circle"
                  wrapperStyle={{ paddingTop: 20 }}
                />
                <Area
                  activeDot={{ r: 7, stroke: "#1890ff", strokeWidth: 2 }}
                  dataKey="文档"
                  dot={{ fill: "#1890ff", r: 5, stroke: "#fff", strokeWidth: 2 }}
                  fill="url(#color文档)"
                  stroke="#1890ff"
                  strokeWidth={3}
                  type="monotone"
                />
                <Area
                  activeDot={{ r: 7, stroke: "#52c41a", strokeWidth: 2 }}
                  dataKey="条码"
                  dot={{ fill: "#52c41a", r: 5, stroke: "#fff", strokeWidth: 2 }}
                  fill="url(#color条码)"
                  stroke="#52c41a"
                  strokeWidth={3}
                  type="monotone"
                />
                <Area
                  activeDot={{ r: 7, stroke: "#fa8c16", strokeWidth: 2 }}
                  dataKey="访问"
                  dot={{ fill: "#fa8c16", r: 5, stroke: "#fff", strokeWidth: 2 }}
                  fill="url(#color访问)"
                  stroke="#fa8c16"
                  strokeWidth={3}
                  type="monotone"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* 文档分类饼图 - 优化样式 */}
        <Col lg={8} md={24} sm={24} xl={8} xs={24}>
          <Card
            style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)" }}
            styles={{ body: { padding: "24px" } }}
            title={
              <Title level={5} style={{ color: "#1f2937", fontWeight: 600, margin: 0 }}>
                文档分类分布
              </Title>
            }
          >
            <ResponsiveContainer height={240} width="100%">
              <PieChart>
                <defs>
                  {documentCategoryData.map((item, index) => (
                    <linearGradient key={index} id={`pieGradient${index}`} x1="0" x2="1" y1="0" y2="1">
                      <stop offset="0%" stopColor={item.gradient[0]} stopOpacity={1} />
                      <stop offset="100%" stopColor={item.gradient[1]} stopOpacity={1} />
                    </linearGradient>
                  ))}
                </defs>
                <Pie
                  cx="50%"
                  cy="50%"
                  data={documentCategoryData}
                  dataKey="value"
                  fill="#8884d8"
                  innerRadius={60}
                  label={({ name, percent }) => {
                    if (percent && percent < 0.05) {
                      return "";
                    }
                    return `${name}\n${percent ? (percent * 100).toFixed(0) : 0}%`;
                  }}
                  labelLine={false}
                  outerRadius={90}
                  paddingAngle={4}
                >
                  {documentCategoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={`url(#pieGradient${index})`} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    border: "1px solid #f0f0f0",
                    borderRadius: 8,
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                  }}
                  formatter={(value: number | undefined) => {
                    const val = value ?? 0;
                    return [`${val} 个`, "数量"];
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ marginTop: 24, textAlign: "center" }}>
              <Statistic
                suffix="个"
                title="文档总数"
                value={totalDocumentValue}
                valueStyle={{ color: "#1f2937", fontSize: 20, fontWeight: 600 }}
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* 部门成员分布柱状图 - 优化样式 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card
            style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)" }}
            styles={{ body: { padding: "24px" } }}
            title={
              <Title level={5} style={{ color: "#1f2937", fontWeight: 600, margin: 0 }}>
                部门成员分布
              </Title>
            }
          >
            <ResponsiveContainer height={320} width="100%">
              <BarChart data={departmentData} margin={{ bottom: 5, left: 20, right: 30, top: 20 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#722ed1" stopOpacity={1} />
                    <stop offset="100%" stopColor="#9254de" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#f0f0f0" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  axisLine={{ stroke: "#e8e8e8" }}
                  dataKey="name"
                  stroke="#8c8c8c"
                  tick={{ fill: "#8c8c8c", fontSize: 12 }}
                />
                <YAxis axisLine={{ stroke: "#e8e8e8" }} stroke="#8c8c8c" tick={{ fill: "#8c8c8c", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e8e8e8",
                    borderRadius: 8,
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                    padding: "12px 16px",
                  }}
                  formatter={(value: number | undefined) => {
                    const val = value ?? 0;
                    return [`${val} 人`, "成员数"];
                  }}
                  labelStyle={{ color: "#1f2937", fontWeight: 600, marginBottom: 8 }}
                />
                <Bar dataKey="成员" fill="url(#barGradient)" maxBarSize={80} radius={[8, 8, 0, 0]}>
                  {departmentData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill="url(#barGradient)" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <div>
        <Title level={4} style={{ color: "#1f2937", fontWeight: 600, marginBottom: 16 }}>
          快捷入口
        </Title>
        <Row gutter={[16, 16]}>
          {quickActions.map((action) => (
            <Col key={action.key} lg={8} md={12} sm={24} xl={8} xs={24}>
              <Card
                hoverable
                style={{
                  borderRadius: 12,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                styles={{
                  body: { padding: "24px" },
                }}
                onClick={() => handleQuickActionClick(action.path)}
              >
                <div style={{ alignItems: "flex-start", display: "flex", gap: 16 }}>
                  <div
                    style={{
                      alignItems: "center",
                      backgroundColor: action.bgColor,
                      borderRadius: 12,
                      color: action.color,
                      display: "flex",
                      fontSize: 24,
                      height: 48,
                      justifyContent: "center",
                      width: 48,
                      flexShrink: 0,
                    }}
                  >
                    {action.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Title
                      level={5}
                      style={{
                        alignItems: "center",
                        color: "#1f2937",
                        display: "flex",
                        fontWeight: 600,
                        justifyContent: "space-between",
                        marginBottom: 8,
                      }}
                    >
                      <span>{action.title}</span>
                      <RightOutlined style={{ color: "#bfbfbf", fontSize: 14 }} />
                    </Title>
                    <Text style={{ fontSize: 14 }} type="secondary">
                      {action.description}
                    </Text>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default Home;
