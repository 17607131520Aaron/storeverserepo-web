import React, { useMemo } from "react";

import { useNavigate } from "react-router-dom";

import {
  AppstoreOutlined,
  BarChartOutlined,
  FileTextOutlined,
  TeamOutlined,
  SettingOutlined,
  BugOutlined,
  RightOutlined,
  ArrowUpOutlined,
} from "@ant-design/icons";
import { Card, Col, Row, Statistic, Typography } from "antd";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const { Title, Text } = Typography;

interface IQuickAction {
  key: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
  bgColor: string;
}

const quickActions: IQuickAction[] = [
  {
    key: "dashboard",
    title: "数据概览",
    description: "查看系统数据统计和分析",
    icon: <BarChartOutlined />,
    path: "/dashboard/overview",
    color: "#1890ff",
    bgColor: "#e6f7ff",
  },
  {
    key: "documents",
    title: "文档管理",
    description: "管理文档和分类",
    icon: <FileTextOutlined />,
    path: "/documents/list",
    color: "#52c41a",
    bgColor: "#f6ffed",
  },
  {
    key: "team",
    title: "团队管理",
    description: "成员、角色和部门管理",
    icon: <TeamOutlined />,
    path: "/team/members",
    color: "#722ed1",
    bgColor: "#f9f0ff",
  },
  {
    key: "barcode",
    title: "条码生成",
    description: "生成和管理条码",
    icon: <AppstoreOutlined />,
    path: "/barcode/manage",
    color: "#fa8c16",
    bgColor: "#fff7e6",
  },
  {
    key: "settings",
    title: "系统设置",
    description: "系统配置和管理",
    icon: <SettingOutlined />,
    path: "/settings/basic",
    color: "#13c2c2",
    bgColor: "#e6fffb",
  },
  {
    key: "debug",
    title: "调试工具",
    description: "服务通APP调试工具",
    icon: <BugOutlined />,
    path: "/smartserviceappDebug/debuglogs",
    color: "#eb2f96",
    bgColor: "#fff0f6",
  },
];

// Mock数据
const mockStats = {
  totalDocuments: 1234,
  totalTeamMembers: 48,
  todayBarcodes: 156,
  systemUptime: 127,
  documentGrowth: 12.5,
  memberGrowth: 8.3,
  barcodeGrowth: 23.1,
};

// 最近7天的数据趋势
const last7DaysData = [
  { name: "周一", 文档: 120, 条码: 45, 访问: 320 },
  { name: "周二", 文档: 132, 条码: 52, 访问: 380 },
  { name: "周三", 文档: 145, 条码: 48, 访问: 410 },
  { name: "周四", 文档: 158, 条码: 61, 访问: 450 },
  { name: "周五", 文档: 142, 条码: 55, 访问: 420 },
  { name: "周六", 文档: 128, 条码: 42, 访问: 360 },
  { name: "周日", 文档: 156, 条码: 58, 访问: 390 },
];

// 文档分类数据
const documentCategoryData = [
  { name: "技术文档", value: 420, color: "#1890ff" },
  { name: "业务文档", value: 380, color: "#52c41a" },
  { name: "设计文档", value: 280, color: "#fa8c16" },
  { name: "其他文档", value: 154, color: "#722ed1" },
];

// 部门成员分布数据
const departmentData = [
  { name: "研发部", 成员: 18 },
  { name: "产品部", 成员: 12 },
  { name: "设计部", 成员: 8 },
  { name: "运营部", 成员: 10 },
];

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
          marginBottom: 24,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          border: "none",
          borderRadius: 12,
        }}
        styles={{ body: { padding: "40px 32px" } }}
      >
        <div style={{ color: "#fff" }}>
          <Title
            level={2}
            style={{
              color: "#fff",
              marginBottom: 12,
              fontWeight: 600,
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
        {/* 数据趋势图 */}
        <Col lg={16} md={24} sm={24} xl={16} xs={24}>
          <Card
            style={{ borderRadius: 12 }}
            styles={{ body: { padding: "24px" } }}
            title={
              <Title level={5} style={{ margin: 0, color: "#1f2937", fontWeight: 600 }}>
                最近7天数据趋势
              </Title>
            }
          >
            <ResponsiveContainer height={300} width="100%">
              <LineChart data={last7DaysData}>
                <CartesianGrid stroke="#f0f0f0" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#8c8c8c" />
                <YAxis stroke="#8c8c8c" />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #f0f0f0",
                  }}
                />
                <Legend />
                <Line
                  activeDot={{ r: 6 }}
                  dataKey="文档"
                  dot={{ fill: "#1890ff", r: 4 }}
                  stroke="#1890ff"
                  strokeWidth={2}
                  type="monotone"
                />
                <Line
                  activeDot={{ r: 6 }}
                  dataKey="条码"
                  dot={{ fill: "#52c41a", r: 4 }}
                  stroke="#52c41a"
                  strokeWidth={2}
                  type="monotone"
                />
                <Line
                  activeDot={{ r: 6 }}
                  dataKey="访问"
                  dot={{ fill: "#fa8c16", r: 4 }}
                  stroke="#fa8c16"
                  strokeWidth={2}
                  type="monotone"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* 文档分类饼图 */}
        <Col lg={8} md={24} sm={24} xl={8} xs={24}>
          <Card
            style={{ borderRadius: 12 }}
            styles={{ body: { padding: "24px" } }}
            title={
              <Title level={5} style={{ margin: 0, color: "#1f2937", fontWeight: 600 }}>
                文档分类分布
              </Title>
            }
          >
            <ResponsiveContainer height={300} width="100%">
              <PieChart>
                <Pie
                  cx="50%"
                  cy="50%"
                  data={documentCategoryData}
                  dataKey="value"
                  fill="#8884d8"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                  outerRadius={80}
                >
                  {documentCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #f0f0f0",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ marginTop: 16, textAlign: "center" }}>
              <Statistic
                suffix="个"
                title="文档总数"
                value={totalDocumentValue}
                valueStyle={{ fontSize: 20, fontWeight: 600 }}
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* 部门成员分布柱状图 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card
            style={{ borderRadius: 12 }}
            styles={{ body: { padding: "24px" } }}
            title={
              <Title level={5} style={{ margin: 0, color: "#1f2937", fontWeight: 600 }}>
                部门成员分布
              </Title>
            }
          >
            <ResponsiveContainer height={300} width="100%">
              <BarChart data={departmentData}>
                <CartesianGrid stroke="#f0f0f0" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#8c8c8c" />
                <YAxis stroke="#8c8c8c" />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #f0f0f0",
                  }}
                />
                <Bar dataKey="成员" fill="#722ed1" radius={[8, 8, 0, 0]}>
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="#722ed1" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* 快捷入口 */}
      <div>
        <Title level={4} style={{ marginBottom: 16, color: "#1f2937", fontWeight: 600 }}>
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
                <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      backgroundColor: action.bgColor,
                      color: action.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 24,
                      flexShrink: 0,
                    }}
                  >
                    {action.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Title
                      level={5}
                      style={{
                        marginBottom: 8,
                        color: "#1f2937",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>{action.title}</span>
                      <RightOutlined style={{ fontSize: 14, color: "#bfbfbf" }} />
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
