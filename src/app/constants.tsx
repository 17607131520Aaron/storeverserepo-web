import {
  ApiOutlined,
  AppstoreOutlined,
  BarChartOutlined,
  BugOutlined,
  DeleteOutlined,
  FileSearchOutlined,
  FileTextOutlined,
  FolderOutlined,
  HomeOutlined,
  LogoutOutlined,
  SafetyOutlined,
  SettingOutlined,
  TeamOutlined,
  UnorderedListOutlined,
  UsergroupAddOutlined,
  UserOutlined,
} from "@ant-design/icons";

import type { MenuProps } from "antd";
// 菜单项配置 - 支持一级和二级菜单
export const menuItems: MenuProps["items"] = [
  {
    key: "/",
    icon: <HomeOutlined />,
    label: "首页",
  },
  {
    key: "dashboard",
    icon: <AppstoreOutlined />,
    label: "仪表盘",
    children: [
      {
        key: "/dashboard/overview",
        icon: <BarChartOutlined />,
        label: "数据概览",
      },
      {
        key: "/dashboard/analysis",
        icon: <AppstoreOutlined />,
        label: "统计分析",
      },
    ],
  },
  {
    key: "documents",
    icon: <FileTextOutlined />,
    label: "文档管理",
    children: [
      {
        key: "/documents/list",
        icon: <FileTextOutlined />,
        label: "文档列表",
      },
      {
        key: "/documents/category",
        icon: <FolderOutlined />,
        label: "文档分类",
      },
      {
        key: "/documents/trash",
        icon: <DeleteOutlined />,
        label: "回收站",
      },
    ],
  },
  {
    key: "team",
    icon: <TeamOutlined />,
    label: "团队管理",
    children: [
      {
        key: "/team/members",
        icon: <UsergroupAddOutlined />,
        label: "成员管理",
      },
      {
        key: "/team/roles",
        icon: <UserOutlined />,
        label: "角色权限",
      },
      {
        key: "/team/departments",
        icon: <TeamOutlined />,
        label: "部门管理",
      },
    ],
  },
  {
    key: "barcode",
    icon: <BarChartOutlined />,
    label: "条码管理",
    children: [
      {
        key: "/barcode/manage",
        icon: <BarChartOutlined />,
        label: "条码生成",
      },
    ],
  },
  {
    key: "settings",
    icon: <SettingOutlined />,
    label: "系统设置",
    children: [
      {
        key: "/settings/basic",
        icon: <SettingOutlined />,
        label: "基础设置",
      },
      {
        key: "/settings/security",
        icon: <SafetyOutlined />,
        label: "安全设置",
      },
      {
        key: "/settings/logs",
        icon: <FileSearchOutlined />,
        label: "日志管理",
      },
    ],
  },
  {
    key: "rndebug",
    icon: <BugOutlined />,
    label: "react native调试工具",
    children: [
      {
        key: "/smartserviceappDebug/debuglogs",
        icon: <UnorderedListOutlined />,
        label: "日志",
      },
      {
        key: "/smartserviceappDebug/network",
        icon: <ApiOutlined />,
        label: "网络",
      },
    ],
  },
];

// 用户下拉菜单
export const userMenuItems: MenuProps["items"] = [
  {
    key: "profile",
    icon: <UserOutlined />,
    label: "个人中心",
  },
  {
    key: "settings",
    icon: <SettingOutlined />,
    label: "账户设置",
  },
  {
    type: "divider",
  },
  {
    key: "logout",
    icon: <LogoutOutlined />,
    label: "退出登录",
    danger: true,
  },
];
