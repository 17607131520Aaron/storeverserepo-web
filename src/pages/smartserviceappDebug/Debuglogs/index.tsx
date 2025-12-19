import React from "react";

import {
  ClearOutlined,
  DisconnectOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { Badge, Button, Card, Input, InputNumber, Select, Space, Spin, Tooltip, Typography } from "antd";

import { DEFAULT_PORT, getLogLevelColor, levelOptions } from "./constants";
import { useDebuglogs, type ConnectionMode } from "./useDebuglogs";
import "./index.module.scss";

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
    isPaused,
    levelFilter,
    setLevelFilter,
    searchText,
    setSearchText,
    filteredLogs,
    handleConnectClick,
    handleClearLogs,
    handlePause,
    handleClose,
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
              <Badge status={isConnected ? "success" : "error"} text={isConnected ? "已连接" : "未连接"} />
            )}
          </Space>

          <Space>
            <Text strong>端口：</Text>
            <InputNumber
              max={9999}
              min={1}
              placeholder="请输入端口"
              style={{ width: 120 }}
              value={port}
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
              options={connectionModeOptions}
              style={{ width: 120 }}
              value={connectionMode}
              onChange={(value: ConnectionMode) => setConnectionMode(value)}
            />
          </Space>

          <Space>
            <Tooltip title="连接">
              <Button icon={<ReloadOutlined />} loading={isConnecting} type="primary" onClick={handleConnectClick}>
                {isConnected ? "重连" : "连接"}
              </Button>
            </Tooltip>

            <Tooltip title={isPaused ? "恢复" : "暂停"}>
              <Button
                disabled={!isConnected}
                icon={isPaused ? <PlayCircleOutlined /> : <PauseCircleOutlined />}
                onClick={handlePause}
              >
                {isPaused ? "恢复" : "暂停"}
              </Button>
            </Tooltip>

            <Tooltip title="关闭连接">
              <Button danger disabled={!isConnected && !isConnecting} icon={<StopOutlined />} onClick={handleClose}>
                关闭
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
              options={levelOptions || []}
              placeholder="日志级别"
              style={{ width: "100px" }}
              value={levelFilter}
              onChange={(value: string) => setLevelFilter(value)}
            />
            <Search
              allowClear
              placeholder="搜索日志..."
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
                {isConnected ? "已连接，等待日志输出..." : "未连接，请点击连接按钮连接到 Metro bundler"}
              </Text>
              <Text style={{ fontSize: "12px", marginTop: 8 }} type="secondary">
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
                <span className="rn-debug-logs-level" style={{ color: getLogLevelColor(log.level) }}>
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
