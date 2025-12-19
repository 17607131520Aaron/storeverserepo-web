import React from "react";

import { MoonOutlined, SunOutlined } from "@ant-design/icons";
import { Button, Dropdown, type MenuProps } from "antd";

import { useThemeStore } from "@/store/theme/theme";
import { getCurrentTheme, type ThemeMode } from "@/utils/theme";

/**
 * 主题切换组件
 * 提供亮色/暗色/自动三种主题模式切换
 */
const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useThemeStore();
  const currentTheme = getCurrentTheme();

  const handleMenuClick = ({ key }: { key: string }): void => {
    const validThemes: ThemeMode[] = ["light", "dark", "auto"];
    if (validThemes.includes(key as ThemeMode)) {
      setTheme(key as ThemeMode);
    }
  };

  const menuItems: MenuProps["items"] = [
    {
      key: "light",
      label: "亮色模式",
      icon: <SunOutlined />,
    },
    {
      key: "dark",
      label: "暗色模式",
      icon: <MoonOutlined />,
    },
    {
      key: "auto",
      label: "跟随系统",
      icon: <span>🔄</span>,
    },
  ];

  return (
    <Dropdown
      menu={{
        items: menuItems,
        selectedKeys: [theme],
        onClick: handleMenuClick,
      }}
      placement="bottomRight"
    >
      <Button icon={currentTheme === "dark" ? <MoonOutlined /> : <SunOutlined />} title="切换主题" type="text" />
    </Dropdown>
  );
};

export default ThemeToggle;
