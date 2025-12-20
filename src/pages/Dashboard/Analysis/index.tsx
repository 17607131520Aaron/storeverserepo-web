import React, { useMemo } from "react";

import { ArrowUpOutlined, ShoppingCartOutlined, TeamOutlined, UserOutlined } from "@ant-design/icons";
import { Card, Col, Row, Statistic, Typography } from "antd";
import ReactECharts from "echarts-for-react";

const { Title } = Typography;

// Mock 统计数据
const mockStatistics = {
  totalUsers: 1248,
  userGrowth: 12.5,
  totalOrders: 8562,
  orderGrowth: 8.3,
  totalRevenue: 1256800,
  revenueGrowth: 15.6,
  activeUsers: 892,
  activeUserGrowth: 5.2,
};

// 最近30天的访问趋势数据
const visitTrendData = Array.from({ length: 30 }, (_, i) => ({
  date: `${i + 1}日`,
  访问量: Math.floor(Math.random() * 500) + 800,
  活跃用户: Math.floor(Math.random() * 300) + 500,
  新用户: Math.floor(Math.random() * 200) + 100,
}));

// 月度销售数据
const monthlySalesData = [
  { month: "1月", 销售额: 125000, 订单数: 680, 利润: 45000 },
  { month: "2月", 销售额: 138000, 订单数: 720, 利润: 52000 },
  { month: "3月", 销售额: 152000, 订单数: 790, 利润: 58000 },
  { month: "4月", 销售额: 145000, 订单数: 750, 利润: 55000 },
  { month: "5月", 销售额: 168000, 订单数: 850, 利润: 65000 },
  { month: "6月", 销售额: 175000, 订单数: 890, 利润: 68000 },
];

// 产品分类占比数据
const productCategoryData = [
  { name: "电子产品", value: 35, color: "#1890ff" },
  { name: "服装配饰", value: 28, color: "#52c41a" },
  { name: "家居用品", value: 20, color: "#fa8c16" },
  { name: "食品饮料", value: 12, color: "#722ed1" },
  { name: "其他", value: 5, color: "#eb2f96" },
];

// 地区销售分布数据
const regionSalesData = [
  { region: "华东", 销售额: 420000, 订单数: 2850 },
  { region: "华南", 销售额: 380000, 订单数: 2650 },
  { region: "华北", 销售额: 320000, 订单数: 2250 },
  { region: "西南", 销售额: 280000, 订单数: 1950 },
  { region: "东北", 销售额: 180000, 订单数: 1250 },
  { region: "西北", 销售额: 150000, 订单数: 1050 },
];

// 用户行为雷达图数据
const userBehaviorData = [
  { subject: "访问频率", A: 85, fullMark: 100 },
  { subject: "购买转化", A: 72, fullMark: 100 },
  { subject: "活跃度", A: 90, fullMark: 100 },
  { subject: "留存率", A: 68, fullMark: 100 },
  { subject: "满意度", A: 88, fullMark: 100 },
  { subject: "推荐度", A: 75, fullMark: 100 },
];

// 周度对比数据
const weeklyComparisonData = [
  { week: "第1周", 本周: 1250, 上周: 1180 },
  { week: "第2周", 本周: 1320, 上周: 1250 },
  { week: "第3周", 本周: 1280, 上周: 1300 },
  { week: "第4周", 本周: 1450, 上周: 1380 },
];

const DashboardAnalysis: React.FC = () => {
  // 计算产品分类总数
  const totalProductValue = useMemo(() => {
    return productCategoryData.reduce((sum, item) => sum + item.value, 0);
  }, []);

  return (
    <div style={{ padding: 12 }}>
      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col lg={6} md={12} sm={24} xl={6} xs={24}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              prefix={<UserOutlined style={{ fontSize: 16 }} />}
              suffix="人"
              title="总用户数"
              value={mockStatistics.totalUsers}
              valueStyle={{ color: "#1890ff", fontSize: 28, fontWeight: 600 }}
            />
            <div style={{ marginTop: 8 }}>
              <span style={{ fontSize: 12, color: "#52c41a" }}>
                <ArrowUpOutlined style={{ fontSize: 12 }} /> {mockStatistics.userGrowth}%
              </span>
              <span style={{ fontSize: 12, color: "#8c8c8c", marginLeft: 8 }}>较上月</span>
            </div>
          </Card>
        </Col>
        <Col lg={6} md={12} sm={24} xl={6} xs={24}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              prefix={<ShoppingCartOutlined style={{ fontSize: 16 }} />}
              suffix="单"
              title="总订单数"
              value={mockStatistics.totalOrders}
              valueStyle={{ color: "#52c41a", fontSize: 28, fontWeight: 600 }}
            />
            <div style={{ marginTop: 8 }}>
              <span style={{ fontSize: 12, color: "#52c41a" }}>
                <ArrowUpOutlined style={{ fontSize: 12 }} /> {mockStatistics.orderGrowth}%
              </span>
              <span style={{ fontSize: 12, color: "#8c8c8c", marginLeft: 8 }}>较上月</span>
            </div>
          </Card>
        </Col>
        <Col lg={6} md={12} sm={24} xl={6} xs={24}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              precision={0}
              prefix="¥"
              suffix=""
              title="总销售额"
              value={mockStatistics.totalRevenue}
              valueStyle={{ color: "#fa8c16", fontSize: 28, fontWeight: 600 }}
            />
            <div style={{ marginTop: 8 }}>
              <span style={{ fontSize: 12, color: "#52c41a" }}>
                <ArrowUpOutlined style={{ fontSize: 12 }} /> {mockStatistics.revenueGrowth}%
              </span>
              <span style={{ fontSize: 12, color: "#8c8c8c", marginLeft: 8 }}>较上月</span>
            </div>
          </Card>
        </Col>
        <Col lg={6} md={12} sm={24} xl={6} xs={24}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              prefix={<TeamOutlined style={{ fontSize: 16 }} />}
              suffix="人"
              title="活跃用户"
              value={mockStatistics.activeUsers}
              valueStyle={{ color: "#722ed1", fontSize: 28, fontWeight: 600 }}
            />
            <div style={{ marginTop: 8 }}>
              <span style={{ fontSize: 12, color: "#52c41a" }}>
                <ArrowUpOutlined style={{ fontSize: 12 }} /> {mockStatistics.activeUserGrowth}%
              </span>
              <span style={{ fontSize: 12, color: "#8c8c8c", marginLeft: 8 }}>较上月</span>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 访问趋势图 - 面积图 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card
            style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)" }}
            styles={{ body: { padding: "24px" } }}
            title={
              <Title level={5} style={{ color: "#1f2937", fontWeight: 600, margin: 0 }}>
                最近30天访问趋势
              </Title>
            }
          >
            <ReactECharts
              option={{
                tooltip: {
                  backgroundColor: "rgba(50, 50, 50, 0.9)",
                  borderColor: "#777",
                  borderWidth: 1,
                  textStyle: { color: "#fff" },
                  trigger: "axis",
                },
                legend: {
                  data: ["访问量", "活跃用户", "新用户"],
                  textStyle: { color: "#595959", fontSize: 12 },
                  top: 10,
                },
                grid: {
                  left: "3%",
                  right: "4%",
                  bottom: "3%",
                  containLabel: true,
                },
                xAxis: {
                  data: visitTrendData.map((item) => item.date),
                  type: "category",
                  boundaryGap: false,
                  axisLine: { lineStyle: { color: "#e8e8e8" } },
                  axisLabel: { color: "#8c8c8c", fontSize: 12 },
                },
                yAxis: {
                  type: "value",
                  axisLine: { lineStyle: { color: "#e8e8e8" } },
                  axisLabel: { color: "#8c8c8c", fontSize: 12 },
                  splitLine: { lineStyle: { color: "#f0f0f0", type: "dashed" } },
                },
                series: [
                  {
                    data: visitTrendData.map((item) => item.访问量),
                    name: "访问量",
                    smooth: true,
                    type: "line",
                    areaStyle: {
                      color: {
                        type: "linear",
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [
                          { offset: 0, color: "rgba(24, 144, 255, 0.4)" },
                          { offset: 1, color: "rgba(24, 144, 255, 0)" },
                        ],
                      },
                    },
                    itemStyle: { color: "#1890ff" },
                    lineStyle: { color: "#1890ff", width: 2 },
                  },
                  {
                    data: visitTrendData.map((item) => item.活跃用户),
                    name: "活跃用户",
                    smooth: true,
                    type: "line",
                    areaStyle: {
                      color: {
                        type: "linear",
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [
                          { offset: 0, color: "rgba(82, 196, 26, 0.4)" },
                          { offset: 1, color: "rgba(82, 196, 26, 0)" },
                        ],
                      },
                    },
                    itemStyle: { color: "#52c41a" },
                    lineStyle: { color: "#52c41a", width: 2 },
                  },
                  {
                    data: visitTrendData.map((item) => item.新用户),
                    name: "新用户",
                    smooth: true,
                    type: "line",
                    areaStyle: {
                      color: {
                        type: "linear",
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [
                          { offset: 0, color: "rgba(250, 140, 22, 0.4)" },
                          { offset: 1, color: "rgba(250, 140, 22, 0)" },
                        ],
                      },
                    },
                    itemStyle: { color: "#fa8c16" },
                    lineStyle: { color: "#fa8c16", width: 2 },
                  },
                ],
              }}
              style={{ height: "350px", width: "100%" }}
            />
          </Card>
        </Col>
      </Row>

      {/* 月度销售数据 - 组合图 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col lg={16} md={24} sm={24} xl={16} xs={24}>
          <Card
            style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)" }}
            styles={{ body: { padding: "24px" } }}
            title={
              <Title level={5} style={{ color: "#1f2937", fontWeight: 600, margin: 0 }}>
                月度销售数据分析
              </Title>
            }
          >
            <ReactECharts
              option={{
                tooltip: {
                  backgroundColor: "rgba(50, 50, 50, 0.9)",
                  borderColor: "#777",
                  borderWidth: 1,
                  textStyle: { color: "#fff" },
                  trigger: "axis",
                },
                legend: {
                  data: ["销售额", "订单数"],
                  textStyle: { color: "#595959", fontSize: 12 },
                  top: 10,
                },
                grid: {
                  left: "3%",
                  right: "4%",
                  bottom: "3%",
                  containLabel: true,
                },
                xAxis: {
                  data: monthlySalesData.map((item) => item.month),
                  type: "category",
                  axisLine: { lineStyle: { color: "#e8e8e8" } },
                  axisLabel: { color: "#8c8c8c", fontSize: 12 },
                },
                yAxis: [
                  {
                    type: "value",
                    name: "销售额",
                    position: "left",
                    axisLine: { lineStyle: { color: "#e8e8e8" } },
                    axisLabel: { color: "#8c8c8c", fontSize: 12 },
                    splitLine: { lineStyle: { color: "#f0f0f0", type: "dashed" } },
                  },
                  {
                    type: "value",
                    name: "订单数",
                    position: "right",
                    axisLine: { lineStyle: { color: "#e8e8e8" } },
                    axisLabel: { color: "#8c8c8c", fontSize: 12 },
                  },
                ],
                series: [
                  {
                    data: monthlySalesData.map((item) => item.销售额),
                    name: "销售额",
                    type: "bar",
                    itemStyle: {
                      color: {
                        type: "linear",
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [
                          { offset: 0, color: "#722ed1" },
                          { offset: 1, color: "#9254de" },
                        ],
                      },
                      borderRadius: [8, 8, 0, 0],
                    },
                    yAxisIndex: 0,
                  },
                  {
                    data: monthlySalesData.map((item) => item.订单数),
                    name: "订单数",
                    smooth: true,
                    type: "line",
                    itemStyle: { color: "#52c41a" },
                    lineStyle: { color: "#52c41a", width: 3 },
                    yAxisIndex: 1,
                  },
                ],
              }}
              style={{ height: "400px", width: "100%" }}
            />
          </Card>
        </Col>

        {/* 产品分类占比 - 饼图 */}
        <Col lg={8} md={24} sm={24} xl={8} xs={24}>
          <Card
            style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)" }}
            styles={{ body: { padding: "24px" } }}
            title={
              <Title level={5} style={{ color: "#1f2937", fontWeight: 600, margin: 0 }}>
                产品分类占比
              </Title>
            }
          >
            <ReactECharts
              option={{
                tooltip: {
                  backgroundColor: "rgba(50, 50, 50, 0.9)",
                  borderColor: "#777",
                  borderWidth: 1,
                  formatter: "{b}: {c}% ({d}%)",
                  textStyle: { color: "#fff" },
                },
                series: [
                  {
                    data: productCategoryData.map((item) => ({
                      name: item.name,
                      value: item.value,
                      itemStyle: { color: item.color },
                    })),
                    emphasis: {
                      itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: "rgba(0, 0, 0, 0.5)",
                      },
                    },
                    label: {
                      formatter: "{b}\n{d}%",
                      show: true,
                    },
                    labelLine: {
                      show: true,
                    },
                    name: "产品分类",
                    radius: ["40%", "70%"],
                    type: "pie",
                  },
                ],
              }}
              style={{ height: "300px", width: "100%" }}
            />
            <div style={{ marginTop: 24, textAlign: "center" }}>
              <Statistic
                suffix="%"
                title="总占比"
                value={totalProductValue}
                valueStyle={{ color: "#1f2937", fontSize: 20, fontWeight: 600 }}
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* 地区销售分布 - 柱状图 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col lg={12} md={24} sm={24} xl={12} xs={24}>
          <Card
            style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)" }}
            styles={{ body: { padding: "24px" } }}
            title={
              <Title level={5} style={{ color: "#1f2937", fontWeight: 600, margin: 0 }}>
                地区销售分布
              </Title>
            }
          >
            <ReactECharts
              option={{
                tooltip: {
                  backgroundColor: "rgba(50, 50, 50, 0.9)",
                  borderColor: "#777",
                  borderWidth: 1,
                  formatter: (params: { name: string; value: number }) => {
                    return `${params.name}<br/>销售额: ¥${params.value.toLocaleString()}`;
                  },
                  textStyle: { color: "#fff" },
                },
                grid: {
                  left: "3%",
                  right: "4%",
                  bottom: "3%",
                  containLabel: true,
                },
                xAxis: {
                  data: regionSalesData.map((item) => item.region),
                  type: "category",
                  axisLine: { lineStyle: { color: "#e8e8e8" } },
                  axisLabel: { color: "#8c8c8c", fontSize: 12 },
                },
                yAxis: {
                  type: "value",
                  axisLine: { lineStyle: { color: "#e8e8e8" } },
                  axisLabel: {
                    color: "#8c8c8c",
                    fontSize: 12,
                    formatter: (value: number) => `¥${(value / 1000).toFixed(0)}k`,
                  },
                  splitLine: { lineStyle: { color: "#f0f0f0", type: "dashed" } },
                },
                series: [
                  {
                    data: regionSalesData.map((item) => item.销售额),
                    name: "销售额",
                    type: "bar",
                    itemStyle: {
                      color: {
                        type: "linear",
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [
                          { offset: 0, color: "#1890ff" },
                          { offset: 1, color: "#40a9ff" },
                        ],
                      },
                      borderRadius: [8, 8, 0, 0],
                    },
                  },
                ],
              }}
              style={{ height: "400px", width: "100%" }}
            />
          </Card>
        </Col>

        {/* 周度对比 - 折线图 */}
        <Col lg={12} md={24} sm={24} xl={12} xs={24}>
          <Card
            style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)" }}
            styles={{ body: { padding: "24px" } }}
            title={
              <Title level={5} style={{ color: "#1f2937", fontWeight: 600, margin: 0 }}>
                周度数据对比
              </Title>
            }
          >
            <ReactECharts
              option={{
                tooltip: {
                  backgroundColor: "rgba(50, 50, 50, 0.9)",
                  borderColor: "#777",
                  borderWidth: 1,
                  textStyle: { color: "#fff" },
                  trigger: "axis",
                },
                legend: {
                  data: ["本周", "上周"],
                  textStyle: { color: "#595959", fontSize: 12 },
                  top: 10,
                },
                grid: {
                  left: "3%",
                  right: "4%",
                  bottom: "3%",
                  containLabel: true,
                },
                xAxis: {
                  data: weeklyComparisonData.map((item) => item.week),
                  type: "category",
                  axisLine: { lineStyle: { color: "#e8e8e8" } },
                  axisLabel: { color: "#8c8c8c", fontSize: 12 },
                },
                yAxis: {
                  type: "value",
                  axisLine: { lineStyle: { color: "#e8e8e8" } },
                  axisLabel: { color: "#8c8c8c", fontSize: 12 },
                  splitLine: { lineStyle: { color: "#f0f0f0", type: "dashed" } },
                },
                series: [
                  {
                    data: weeklyComparisonData.map((item) => item.本周),
                    name: "本周",
                    smooth: true,
                    type: "line",
                    itemStyle: { color: "#1890ff" },
                    lineStyle: { color: "#1890ff", width: 3 },
                    symbol: "circle",
                    symbolSize: 8,
                  },
                  {
                    data: weeklyComparisonData.map((item) => item.上周),
                    name: "上周",
                    smooth: true,
                    type: "line",
                    itemStyle: { color: "#fa8c16" },
                    lineStyle: { color: "#fa8c16", width: 3, type: "dashed" },
                    symbol: "circle",
                    symbolSize: 8,
                  },
                ],
              }}
              style={{ height: "400px", width: "100%" }}
            />
          </Card>
        </Col>
      </Row>

      {/* 用户行为分析 - 雷达图 */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card
            style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)" }}
            styles={{ body: { padding: "24px" } }}
            title={
              <Title level={5} style={{ color: "#1f2937", fontWeight: 600, margin: 0 }}>
                用户行为分析
              </Title>
            }
          >
            <ReactECharts
              option={{
                tooltip: {
                  backgroundColor: "rgba(50, 50, 50, 0.9)",
                  borderColor: "#777",
                  borderWidth: 1,
                  textStyle: { color: "#fff" },
                },
                radar: {
                  indicator: userBehaviorData.map((item) => ({
                    name: item.subject,
                    max: item.fullMark,
                  })),
                  center: ["50%", "55%"],
                  radius: "70%",
                  nameGap: 10,
                  splitArea: {
                    areaStyle: {
                      color: ["rgba(250, 250, 250, 0.3)", "rgba(200, 200, 200, 0.1)"],
                    },
                  },
                  axisLine: { lineStyle: { color: "#e8e8e8" } },
                  splitLine: { lineStyle: { color: "#e8e8e8" } },
                  name: {
                    textStyle: { color: "#8c8c8c", fontSize: 12 },
                  },
                },
                series: [
                  {
                    data: [
                      {
                        name: "用户行为",
                        value: userBehaviorData.map((item) => item.A),
                        itemStyle: { color: "#1890ff" },
                        areaStyle: {
                          color: "rgba(24, 144, 255, 0.3)",
                        },
                        lineStyle: { color: "#1890ff", width: 2 },
                      },
                    ],
                    type: "radar",
                  },
                ],
              }}
              style={{ height: "400px", width: "100%" }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardAnalysis;
