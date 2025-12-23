import React, { useState } from "react";

import {
  ClearOutlined,
  DisconnectOutlined,
  DownOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
  RightOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { Badge, Button, Card, Input, InputNumber, Select, Space, Spin, Tooltip, Typography } from "antd";

import { DEFAULT_PORT, getLogLevelColor, levelOptions } from "./constants";
import { useDebuglogs, type ConnectionMode } from "./useDebuglogs";
import "./index.scss";

const { Text } = Typography;
const { Search } = Input;

// 递归渲染 JSON 值的组件（类似 Chrome DevTools）
const JsonValue: React.FC<{
  level?: number;
  parentKey?: string;
  value: unknown;
}> = ({ level = 0, parentKey: _parentKey, value }) => {
  const [isExpanded, setIsExpanded] = useState(level < 2); // 默认展开前 2 层

  const indent = level * 16;

  // 字符串
  if (typeof value === "string") {
    return <span className="json-string">"{value}"</span>;
  }

  // 数字
  if (typeof value === "number") {
    return <span className="json-number">{value}</span>;
  }

  // 布尔值
  if (typeof value === "boolean") {
    return <span className="json-boolean">{value ? "true" : "false"}</span>;
  }

  // null
  if (value === null) {
    return <span className="json-null">null</span>;
  }

  // undefined
  if (value === undefined) {
    return <span className="json-undefined">undefined</span>;
  }

  // 数组
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return (
        <span>
          <span className="json-bracket">[</span>
          <span className="json-bracket">]</span>
        </span>
      );
    }

    const preview = value.length === 1 ? "1 item" : `${value.length} items`;

    return (
      <span>
        <span
          className="json-toggle"
          style={{ cursor: "pointer", userSelect: "none", marginRight: 4 }}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <DownOutlined style={{ fontSize: 10 }} /> : <RightOutlined style={{ fontSize: 10 }} />}
        </span>
        <span className="json-bracket">[</span>
        {isExpanded ? (
          <>
            <div style={{ marginLeft: indent + 16 }}>
              {value.map((item, index) => (
                <div key={index} className="json-line">
                  <JsonValue level={level + 1} value={item} />
                  {index < value.length - 1 && <span className="json-comma">,</span>}
                </div>
              ))}
            </div>
            <div style={{ marginLeft: indent }}>
              <span className="json-bracket">]</span>
            </div>
          </>
        ) : (
          <span className="json-preview">{preview}</span>
        )}
        {!isExpanded && <span className="json-bracket">]</span>}
      </span>
    );
  }

  // 对象
  if (typeof value === "object") {
    const entries = Object.entries(value);
    if (entries.length === 0) {
      return (
        <span>
          <span className="json-brace">{`{`}</span>
          <span className="json-brace">{`}`}</span>
        </span>
      );
    }

    const preview = entries.length === 1 ? "1 property" : `${entries.length} properties`;

    return (
      <span>
        <span
          className="json-toggle"
          style={{ cursor: "pointer", userSelect: "none", marginRight: 4 }}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <DownOutlined style={{ fontSize: 10 }} /> : <RightOutlined style={{ fontSize: 10 }} />}
        </span>
        <span className="json-brace">{`{`}</span>
        {isExpanded ? (
          <>
            <div style={{ marginLeft: indent + 16 }}>
              {entries.map(([key, val], index) => (
                <div key={key} className="json-line">
                  <span className="json-key">"{key}"</span>
                  <span className="json-colon">: </span>
                  <JsonValue level={level + 1} parentKey={key} value={val} />
                  {index < entries.length - 1 && <span className="json-comma">,</span>}
                </div>
              ))}
            </div>
            <div style={{ marginLeft: indent }}>
              <span className="json-brace">{`}`}</span>
            </div>
          </>
        ) : (
          <span className="json-preview">{preview}</span>
        )}
        {!isExpanded && <span className="json-brace">{`}`}</span>}
      </span>
    );
  }

  return <span>{String(value)}</span>;
};

// JSON 折叠查看组件（类似 Chrome DevTools）
const CollapsibleJson: React.FC<{ message: string }> = ({ message }) => {
  const [jsonData, setJsonData] = useState<{ isValid: boolean; parsed: unknown; jsonString: string } | null>(null);

  // 检测是否是 JSON 格式
  React.useEffect(() => {
    const trimmed = message.trim();

    // 检查是否以 { 或 [ 开头，可能是 JSON
    if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
      try {
        // 尝试解析为 JSON
        const parsed = JSON.parse(trimmed);
        setJsonData({ isValid: true, parsed, jsonString: trimmed });
      } catch {
        // 不是有效 JSON
        setJsonData({ isValid: false, parsed: null, jsonString: "" });
      }
    } else {
      // 尝试查找消息中的 JSON 部分（以 { 或 [ 开头）
      const jsonMatch = trimmed.match(/(\{.*\}|\[.*\])/s);
      if (jsonMatch) {
        try {
          const jsonStr = jsonMatch[1];
          const parsed = JSON.parse(jsonStr);
          setJsonData({ isValid: true, parsed, jsonString: jsonStr });
        } catch {
          setJsonData({ isValid: false, parsed: null, jsonString: "" });
        }
      } else {
        setJsonData({ isValid: false, parsed: null, jsonString: "" });
      }
    }
  }, [message]);

  // 如果不是有效 JSON，直接显示原文本
  if (!jsonData || !jsonData.isValid) {
    return <span>{message}</span>;
  }

  return (
    <div className="chrome-like-json">
      <JsonValue level={0} value={jsonData.parsed} />
    </div>
  );
};

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
                默认端口: {DEFAULT_PORT} (日志服务器)
              </Text>
              {isConnected && (
                <div style={{ marginTop: 16, padding: 12, background: "#fff3cd", borderRadius: 4, maxWidth: 600 }}>
                  <Text strong style={{ fontSize: "12px", color: "#856404" }}>
                    提示：
                  </Text>
                  <Text style={{ fontSize: "12px", color: "#856404", display: "block", marginTop: 4 }}>
                    React Native 的 console.log 默认不会自动通过 Metro bundler 的 logger WebSocket 发送。
                    <br />
                    如需捕获 JS 日志，请在 React Native 应用中添加日志拦截器来转发 console.log 输出。
                    <br />
                    可参考 storeverserepo-app/src/utils/devWsLogger.ts 的实现方式。
                  </Text>
                </div>
              )}
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
                  <span style={{ color: "#858585", marginRight: 8 }}>
                    {new Date(log.timestamp).toLocaleTimeString()} -
                  </span>
                  <CollapsibleJson message={log.message} />
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
