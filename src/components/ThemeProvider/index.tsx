import React, { useEffect, useState } from "react";

import { ConfigProvider, theme as antdTheme } from "antd";
import ZhCN from "antd/locale/zh_CN";

import { useThemeStore } from "@/store/theme/theme";
import { getCurrentTheme } from "@/utils/theme";

interface IThemeProviderProps {
  children: React.ReactNode;
}

/**
 * 主题提供者组件
 * 自动同步主题到 Ant Design ConfigProvider
 */
const ThemeProvider: React.FC<IThemeProviderProps> = ({ children }) => {
  const { theme: themeMode } = useThemeStore();
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">(getCurrentTheme());

  // 监听主题变化
  useEffect(() => {
    const updateTheme = (): void => {
      setCurrentTheme(getCurrentTheme());
    };

    // 初始设置
    updateTheme();

    // 监听 DOM 属性变化（当主题切换时）
    const observer = new MutationObserver(() => {
      updateTheme();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      observer.disconnect();
    };
  }, [themeMode]);

  return (
    <ConfigProvider
      locale={ZhCN}
      theme={{
        algorithm: currentTheme === "dark" ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
      }}
    >
      {children}
    </ConfigProvider>
  );
};

export default ThemeProvider;
