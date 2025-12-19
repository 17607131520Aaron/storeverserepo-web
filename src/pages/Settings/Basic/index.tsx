import React from "react";

import { MoonOutlined, SunOutlined } from "@ant-design/icons";
import { Card, Descriptions, Radio, Space, Typography } from "antd";

import { useThemeStore } from "@/store/theme/theme";
import { getCurrentTheme, type ThemeMode } from "@/utils/theme";

const { Title } = Typography;

const SettingsBasic: React.FC = () => {
  const { theme, setTheme } = useThemeStore();
  const currentTheme = getCurrentTheme();

  const handleThemeChange = (e: { target: { value: ThemeMode } }): void => {
    setTheme(e.target.value);
  };

  return (
    <div style={{ padding: "24px 0" }}>
      <Title level={2} style={{ marginBottom: 24 }}>
        基础设置
      </Title>

      <Card style={{ marginBottom: 16 }} title="外观设置">
        <Descriptions bordered column={1}>
          <Descriptions.Item label="主题模式">
            <Radio.Group value={theme} onChange={handleThemeChange}>
              <Space direction="vertical" size="middle">
                <Radio value="light">
                  <Space>
                    <SunOutlined />
                    <span>亮色模式</span>
                  </Space>
                </Radio>
                <Radio value="dark">
                  <Space>
                    <MoonOutlined />
                    <span>暗色模式</span>
                  </Space>
                </Radio>
                <Radio value="auto">
                  <Space>
                    <span>🔄</span>
                    <span>跟随系统</span>
                  </Space>
                </Radio>
              </Space>
            </Radio.Group>
          </Descriptions.Item>
          <Descriptions.Item label="当前应用主题">
            <Space>
              {currentTheme === "dark" ? <MoonOutlined /> : <SunOutlined />}
              <span>{currentTheme === "dark" ? "暗色" : "亮色"}</span>
              {theme === "auto" && <span style={{ color: "var(--color-text-tertiary)" }}>(跟随系统)</span>}
            </Space>
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default SettingsBasic;
