import React, { useEffect, useMemo, useState } from "react";

import { Outlet, useLocation, useNavigate } from "react-router-dom";

import {
  AppstoreOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Dropdown, Layout, Menu, Space, Spin, Typography } from "antd";

import { menuItems, userMenuItems } from "./constants";
import TabsBar from "./TabsBar";
import { TabsProvider, useTabs } from "./TabsContext";

import "./app.scss";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const AppContent: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshKey, refreshingKey, setRefreshingKey } = useTabs();

  // 获取当前选中的菜单项
  const selectedKeys = useMemo(() => {
    const path = location.pathname || "/";
    const keys: string[] = [];

    // 遍历菜单项找到匹配的路径
    menuItems?.forEach((item) => {
      if (!item || typeof item === "string") {
        return;
      }

      // 精确匹配首页
      if (item.key === "/" && (path === "/" || path === "")) {
        keys.push("/");
      } else if (item.key === path) {
        keys.push(path);
      } else if ("children" in item && item.children) {
        item.children.forEach((child) => {
          if (child && typeof child !== "string" && child.key === path) {
            keys.push(path);
          }
        });
      }
    });

    // 如果没有匹配到，默认选中首页
    return keys.length > 0 ? keys : ["/"];
  }, [location.pathname]);

  // 计算需要展开的菜单 keys
  const getKeysToOpen = (path: string): string[] => {
    const keysToOpen: string[] = [];

    menuItems?.forEach((item) => {
      if (!item || typeof item === "string") {
        return;
      }

      if ("children" in item && item.children) {
        const hasMatch = item.children.some(
          (child) => child && typeof child !== "string" && child.key === path,
        );
        if (hasMatch && item.key) {
          keysToOpen.push(item.key as string);
        }
      }
    });

    return keysToOpen;
  };

  // 初始化时计算默认展开的菜单
  const [openKeys, setOpenKeys] = useState<string[]>(() => {
    const path = location.pathname || "/";
    return getKeysToOpen(path);
  });

  // 菜单点击处理
  const handleMenuClick = ({ key }: { key: string }): void => {
    // 只处理叶子节点（有实际路径的菜单项）
    if (key.startsWith("/")) {
      navigate(key);
    }
  };

  // 菜单展开/收起处理
  const handleOpenChange = (keys: string[]): void => {
    setOpenKeys(keys);
  };

  // 用户菜单点击处理
  const handleUserMenuClick = ({ key }: { key: string }): void => {
    if (key === "logout") {
      // 处理退出登录逻辑
      navigate("/login");
    } else if (key === "profile") {
      // 处理个人中心跳转
      navigate("/profile");
    } else if (key === "settings") {
      // 处理账户设置跳转
      navigate("/settings/basic");
    }
  };

  // 监听 refreshKey 变化，当组件重新挂载后清除 loading
  useEffect(() => {
    if (refreshingKey && refreshKey) {
      // 延迟清除 loading，确保组件已经重新挂载并开始渲染
      const timer = setTimeout(() => {
        setRefreshingKey(null);
      }, 300);
      return () => {
        clearTimeout(timer);
      };
    }
    return undefined;
  }, [refreshKey, refreshingKey, setRefreshingKey]);

  // 判断当前页面是否正在刷新
  const currentPath = location.pathname || "/";
  const isRefreshing = refreshingKey !== null && refreshingKey === currentPath;

  return (
    <Layout className="asp-comprehension-home" style={{ height: "100vh", overflow: "hidden" }}>
      <Sider
        collapsible
        className="asp-comprehension-home-menu"
        collapsed={collapsed}
        trigger={null}
        width={240}
      >
        <div className="asp-comprehension-home-menu-header">
          <div className="asp-comprehension-home-menu-logo">
            <div className="asp-comprehension-home-menu-logo-icon">
              <AppstoreOutlined />
            </div>
            {!collapsed && (
              <span className="asp-comprehension-home-menu-logo-title">不知道叫啥的某系统</span>
            )}
          </div>
        </div>

        <div className="asp-comprehension-home-menu-divider" />

        <Menu
          className="asp-comprehension-home-menu-content"
          items={menuItems}
          mode="inline"
          openKeys={openKeys}
          selectedKeys={selectedKeys}
          theme="light"
          onClick={handleMenuClick}
          onOpenChange={handleOpenChange}
        />
      </Sider>

      <Layout style={{ height: "100%", overflow: "hidden" }}>
        <Header className="asp-comprehension-home-header">
          <div className="asp-comprehension-home-header-content">
            <div className="asp-comprehension-home-header-left">
              <div
                className="asp-comprehension-home-header-toggle"
                onClick={() => setCollapsed(!collapsed)}
              >
                {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              </div>
            </div>

            <div className="asp-comprehension-home-header-right">
              <Dropdown
                menu={{
                  items: userMenuItems,
                  onClick: handleUserMenuClick,
                }}
                placement="bottomRight"
              >
                <Space
                  className="asp-comprehension-home-header-content-user"
                  style={{ cursor: "pointer" }}
                >
                  <Avatar
                    icon={<UserOutlined />}
                    size={32}
                    style={{ backgroundColor: "#237ffa" }}
                  />
                  <Text style={{ fontSize: 14, color: "#595959" }}>管理员</Text>
                </Space>
              </Dropdown>
            </div>
          </div>
        </Header>

        <TabsBar />

        <Content className="asp-comprehension-home-content">
          <div className="asp-comprehension-home-content-wrapper">
            <Spin
              size="large"
              spinning={isRefreshing}
              style={{ minHeight: "100%" }}
              tip="页面刷新中..."
            >
              <div style={{ minHeight: "100%" }}>
                <Outlet key={`${location.pathname}-${refreshKey}`} />
              </div>
            </Spin>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <TabsProvider>
      <AppContent />
    </TabsProvider>
  );
};

export default App;
