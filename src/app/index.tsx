import React, { useEffect, useMemo, useRef, useState } from "react";

import { Outlet, useLocation, useNavigate } from "react-router-dom";

import {
  AppstoreOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Dropdown, Input, Layout, List, Menu, Space, Spin, Typography } from "antd";

import useAuth from "@/hooks/useAuth";
import PerformanceMonitor from "@/hooks/usePerformanceMonitor";

import { menuItems, userMenuItems } from "./constants";
import TabsBar from "./TabsBar";
import { TabsProvider, useTabs } from "./TabsContext";

import "./app.scss";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const AppContent: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshKey, refreshingKey, setRefreshingKey, isTabSwitching } = useTabs();
  const [isPageLoading, setIsPageLoading] = useState(false);
  const prevPathRef = useRef<string | null>(null);
  const { logout } = useAuth();

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
        const hasMatch = item.children.some((child) => child && typeof child !== "string" && child.key === path);
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

  // 扁平化菜单项，用于搜索结果展示
  interface IFlatMenuItem {
    key: string;
    label: string;
    parentLabel?: string;
    icon?: React.ReactNode;
  }

  const flattenMenuItems = (items: typeof menuItems, searchText: string): IFlatMenuItem[] => {
    const result: IFlatMenuItem[] = [];
    const searchLower = searchText.toLowerCase();

    items?.forEach((item) => {
      if (!item || typeof item === "string" || item.type === "divider") {
        return;
      }

      const label = "label" in item && item.label ? item.label.toString() : "";
      const labelLower = label.toLowerCase();

      // 如果是一级菜单，检查自身和子菜单
      if ("children" in item && item.children) {
        // 检查子菜单
        item.children.forEach((child) => {
          if (!child || typeof child === "string" || child.type === "divider") {
            return;
          }
          const childLabel = "label" in child && child.label ? child.label.toString() : "";
          const childLabelLower = childLabel.toLowerCase();

          // 如果子菜单匹配
          if (childLabelLower.includes(searchLower)) {
            result.push({
              key: child.key as string,
              label: childLabel,
              parentLabel: label,
              icon: "icon" in child ? child.icon : undefined,
            });
          }
        });

        // 如果父菜单本身也匹配，且父菜单有实际路径（可点击），才添加到结果中
        if (labelLower.includes(searchLower) && item.key && typeof item.key === "string" && item.key.startsWith("/")) {
          result.push({
            key: item.key as string,
            label,
            icon: "icon" in item ? item.icon : undefined,
          });
        }
      } else {
        // 没有子菜单的项，直接检查标题
        if (labelLower.includes(searchLower)) {
          result.push({
            key: item.key as string,
            label,
            icon: "icon" in item ? item.icon : undefined,
          });
        }
      }
    });

    return result;
  };

  // 过滤菜单项（用于树形菜单）
  const filterMenuItems = (items: typeof menuItems, searchText: string): typeof menuItems => {
    if (!searchText.trim()) {
      return items;
    }

    const filtered: typeof menuItems = [];

    items?.forEach((item) => {
      if (!item || typeof item === "string" || item.type === "divider") {
        return;
      }

      const label = "label" in item && item.label ? item.label.toString().toLowerCase() : "";
      const searchLower = searchText.toLowerCase();

      // 如果是一级菜单，检查自身和子菜单
      if ("children" in item && item.children) {
        const filteredChildren = item.children.filter((child) => {
          if (!child || typeof child === "string" || child.type === "divider") {
            return false;
          }
          const childLabel = "label" in child && child.label ? child.label.toString().toLowerCase() : "";
          return childLabel.includes(searchLower);
        });

        // 如果父菜单标题匹配或子菜单有匹配项，则保留
        if (label.includes(searchLower) || filteredChildren.length > 0) {
          filtered.push({
            ...item,
            children: filteredChildren.length > 0 ? filteredChildren : item.children,
          });
        }
      } else {
        // 没有子菜单的项，直接检查标题
        if (label.includes(searchLower)) {
          filtered.push(item);
        }
      }
    });

    return filtered;
  };

  // 根据搜索值生成扁平化搜索结果
  const flatSearchResults = useMemo(() => {
    if (!searchValue.trim()) {
      return [];
    }
    return flattenMenuItems(menuItems, searchValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

  // 根据搜索值过滤菜单（用于树形菜单）
  const filteredMenuItems = useMemo(() => {
    return filterMenuItems(menuItems, searchValue);
  }, [searchValue]);

  // 搜索时自动展开匹配的菜单
  useEffect(() => {
    if (searchValue.trim()) {
      const keysToOpen: string[] = [];
      menuItems?.forEach((item) => {
        if (!item || typeof item === "string" || item.type === "divider") {
          return;
        }
        if ("children" in item && item.children) {
          const hasMatch = item.children.some((child) => {
            if (!child || typeof child === "string" || child.type === "divider") {
              return false;
            }
            const childLabel = "label" in child && child.label ? child.label.toString().toLowerCase() : "";
            return childLabel.includes(searchValue.toLowerCase());
          });
          if (hasMatch && item.key) {
            keysToOpen.push(item.key as string);
          }
        }
      });
      setOpenKeys(keysToOpen);
    } else {
      // 清空搜索时，恢复默认展开状态
      const path = location.pathname || "/";
      setOpenKeys(getKeysToOpen(path));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

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
      void logout().then(() => {
        navigate("/login", { replace: true });
      });
    } else if (key === "profile") {
      // 处理个人中心跳转
      navigate("/profile");
    } else if (key === "settings") {
      // 处理账户设置跳转
      navigate("/settings/basic");
    }
  };

  // 监听路由变化，显示页面加载 loading
  useEffect(() => {
    const currentPath = location.pathname || "/";

    // 如果路径变化（且不是初次加载，且不是标签切换），显示 loading
    if (prevPathRef.current !== null && prevPathRef.current !== currentPath && !isTabSwitching) {
      setIsPageLoading(true);

      // 延迟清除 loading，确保组件已经加载完成
      const timer = setTimeout(() => {
        setIsPageLoading(false);
      }, 300);

      prevPathRef.current = currentPath;

      return () => {
        clearTimeout(timer);
      };
    } else {
      // 初次加载、路径未变化或标签切换，更新 ref 但不显示 loading
      prevPathRef.current = currentPath;
    }
    return undefined;
  }, [location.pathname, isTabSwitching]);

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

  // 判断当前页面是否正在刷新或加载
  const currentPath = location.pathname || "/";
  const isRefreshing = refreshingKey !== null && refreshingKey === currentPath;
  const isLoading = isRefreshing || isPageLoading;

  return (
    <Layout className="asp-comprehension-home" style={{ height: "100vh", overflow: "hidden" }}>
      <Sider
        collapsible
        breakpoint="md"
        className="asp-comprehension-home-menu"
        collapsed={collapsed}
        collapsedWidth={80}
        trigger={null}
        width={240}
        onBreakpoint={(broken) => {
          // 小屏幕时自动折叠侧边栏，提升可用空间；恢复到大屏时展开
          setCollapsed(broken);
        }}
      >
        <div className="asp-comprehension-home-menu-header">
          <div className="asp-comprehension-home-menu-logo">
            <div className="asp-comprehension-home-menu-logo-icon">
              <AppstoreOutlined />
            </div>
            {!collapsed && <span className="asp-comprehension-home-menu-logo-title">不知道叫啥的某系统</span>}
          </div>
        </div>

        {!collapsed ? (
          <div className="asp-comprehension-home-menu-search">
            <Input
              allowClear
              placeholder="搜索菜单"
              prefix={<SearchOutlined />}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>
        ) : (
          <div className="asp-comprehension-home-menu-search-collapsed">
            <div
              className="asp-comprehension-home-menu-search-icon"
              onClick={() => {
                setCollapsed(false);
              }}
            >
              <SearchOutlined />
            </div>
          </div>
        )}

        <div className="asp-comprehension-home-menu-divider" />

        {searchValue.trim() && !collapsed ? (
          <div className="asp-comprehension-home-menu-search-results">
            <div className="asp-comprehension-home-menu-search-results-count">
              共搜索到 {flatSearchResults.length} 项与"{searchValue}"相关的菜单
            </div>
            <List
              className="asp-comprehension-home-menu-search-results-list"
              dataSource={flatSearchResults}
              renderItem={(item) => (
                <List.Item
                  className={`asp-comprehension-home-menu-search-result-item ${
                    selectedKeys.includes(item.key) ? "asp-comprehension-home-menu-search-result-item-selected" : ""
                  }`}
                  onClick={() => {
                    if (item.key.startsWith("/")) {
                      navigate(item.key);
                    }
                  }}
                >
                  <div className="asp-comprehension-home-menu-search-result-content">
                    {item.icon && <span className="asp-comprehension-home-menu-search-result-icon">{item.icon}</span>}
                    <span className="asp-comprehension-home-menu-search-result-label">
                      {item.parentLabel ? `${item.parentLabel} / ${item.label}` : item.label}
                    </span>
                  </div>
                </List.Item>
              )}
            />
          </div>
        ) : (
          <Menu
            className="asp-comprehension-home-menu-content"
            items={filteredMenuItems}
            mode="inline"
            openKeys={openKeys}
            selectedKeys={selectedKeys}
            theme="light"
            onClick={handleMenuClick}
            onOpenChange={handleOpenChange}
          />
        )}
      </Sider>

      <Layout style={{ height: "100%", overflow: "hidden" }}>
        <Header className="asp-comprehension-home-header">
          <div className="asp-comprehension-home-header-content">
            <div className="asp-comprehension-home-header-left">
              <div className="asp-comprehension-home-header-toggle" onClick={() => setCollapsed(!collapsed)}>
                {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              </div>
            </div>

            <div className="asp-comprehension-home-header-center">
              <TabsBar />
            </div>

            <div className="asp-comprehension-home-header-right">
              <Dropdown
                menu={{
                  items: userMenuItems,
                  onClick: handleUserMenuClick,
                }}
                placement="bottomRight"
              >
                <Space className="asp-comprehension-home-header-content-user" style={{ cursor: "pointer" }}>
                  <Avatar icon={<UserOutlined />} size={32} style={{ backgroundColor: "#237ffa" }} />
                  <Text style={{ fontSize: 14, color: "#595959" }}>管理员</Text>
                </Space>
              </Dropdown>
            </div>
          </div>
        </Header>

        <Content className="asp-comprehension-home-content">
          <div className="asp-comprehension-home-content-wrapper">
            <Spin
              size="large"
              spinning={isLoading}
              style={{ height: "100%" }}
              tip={isRefreshing ? "页面刷新中..." : "页面加载中..."}
            >
              <div style={{ height: "100%" }}>
                <PerformanceMonitor enableConsoleLog id={`Page-${location.pathname}`}>
                  <Outlet key={`${location.pathname}-${refreshKey}`} />
                </PerformanceMonitor>
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
