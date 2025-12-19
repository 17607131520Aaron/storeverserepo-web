import React from "react";

import { ClearOutlined, DisconnectOutlined, ReloadOutlined } from "@ant-design/icons";
import {
  Badge,
  Button,
  Card,
  Input,
  InputNumber,
  Select,
  Space,
  Spin,
  Tooltip,
  Typography,
} from "antd";

import { DEFAULT_PORT, getLogLevelColor, levelOptions } from "./constants";
import "./index.scss";
import { useDebuglogs, type ConnectionMode } from "./useDebuglogs";

const { Text } = Typography;
const { Search } = Input;

// 连接模式选项
const connectionModeOptions = [
  { label: "ADB", value: "adb" },
  { label: "WebSocket", value: "websocket" },
];

const RNDebugLogs: React.FC = () => {
  const {
    port,
    setPort,
    connectionMode,
    setConnectionMode,
    isConnecting,
    isConnected,
    levelFilter,
    setLevelFilter,
    searchText,
    setSearchText,
    filteredLogs,
    handleConnectClick,
    handleClearLogs,
  } = useDebuglogs();

  return (
    <div className="rn-debug-logs">
      <Card className="rn-debug-logs-toolbar">
        <Space wrap size="middle" style={{ width: "100%" }}>
          <Space>
            <Text strong>连接状态：</Text>
            {isConnecting ? (
              <Space>
                <Spin size="small" />
                <Text type="secondary">连接中...</Text>
              </Space>
            ) : (
              <Badge
                status={isConnected ? "success" : "error"}
                text={isConnected ? "已连接" : "未连接"}
              />
            )}
          </Space>

          <Space>
            <Text strong>端口：</Text>
            <InputNumber
              value={port}
              min={1}
              max={9999}
              style={{ width: 120 }}
              placeholder="请输入端口"
              onChange={(value: number | null) => {
                if (typeof value === "number") {
                  setPort(value);
                }
              }}
            />
          </Space>

          <Space>
            <Text strong>连接模式：</Text>
            <Select
              value={connectionMode}
              style={{ width: 120 }}
              options={connectionModeOptions}
              onChange={(value: ConnectionMode) => setConnectionMode(value)}
            />
          </Space>

          <Space>
            <Tooltip title="连接">
              <Button
                icon={<ReloadOutlined />}
                type="primary"
                loading={isConnecting}
                onClick={handleConnectClick}
              >
                {isConnected ? "重连" : "连接"}
              </Button>
            </Tooltip>

            <Tooltip title="清除日志">
              <Button icon={<ClearOutlined />} onClick={handleClearLogs}>
                清除
              </Button>
            </Tooltip>
          </Space>

          <Space style={{ marginLeft: "auto" }}>
            <Select
              placeholder="日志级别"
              value={levelFilter}
              style={{ width: "100px" }}
              options={levelOptions || []}
              onChange={(value: string) => setLevelFilter(value)}
            />
            <Search
              placeholder="搜索日志..."
              allowClear
              style={{ width: 400 }}
              value={searchText}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
            />
          </Space>
        </Space>
      </Card>

      <Card className="rn-debug-logs-content">
        <div className="rn-debug-logs-container">
          {filteredLogs.length === 0 ? (
            <div className="rn-debug-logs-empty">
              <DisconnectOutlined style={{ fontSize: 48, color: "#d9d9d9", marginBottom: 16 }} />
              <Text type="secondary">
                {isConnected
                  ? "已连接，等待日志输出..."
                  : "未连接，请点击连接按钮连接到 Metro bundler"}
              </Text>
              <Text type="secondary" style={{ fontSize: "12px", marginTop: 8 }}>
                默认端口: {DEFAULT_PORT}
              </Text>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className="rn-debug-logs-item"
                data-level={log.level === "unknown" ? undefined : log.level}
              >
                <span
                  className="rn-debug-logs-level"
                  style={{ color: getLogLevelColor(log.level) }}
                >
                  [{log.level.toUpperCase()}]
                </span>
                <span className="rn-debug-logs-message">
                  {new Date(log.timestamp).toLocaleTimeString()} - {log.message}
                </span>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default RNDebugLogs;
