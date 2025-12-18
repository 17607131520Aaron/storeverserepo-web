import React, { useEffect, useMemo, useRef, useState } from 'react';

import { ClearOutlined, DisconnectOutlined, ReloadOutlined } from '@ant-design/icons';
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
} from 'antd';

import {
  DEFAULT_MAX_LOGS,
  DEFAULT_METRO_LOGGER_PATH,
  DEFAULT_PORT,
  DEFAULT_RECONNECT_DELAY,
  getLogLevelColor,
  levelOptions,
} from './constants';
import './index.scss';

const { Text } = Typography;
const { Search } = Input;

type ConnectionMode = 'adb' | 'websocket';

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

interface JsLogItem {
  id: string;
  timestamp: number;
  level: LogLevel | 'unknown';
  message: string;
  raw: unknown;
}

interface MetroLogMessage {
  level?: string;
  data?: unknown[];
  message?: unknown;
  [key: string]: unknown;
}

// 连接模式选项
const connectionModeOptions = [
  { label: 'ADB', value: 'adb' },
  { label: 'WebSocket', value: 'websocket' },
];

const RNDebugLogs: React.FC = () => {
  const [port, setPort] = useState<number>(DEFAULT_PORT);
  const [connectionMode, setConnectionMode] = useState<ConnectionMode>('websocket');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [logs, setLogs] = useState<JsLogItem[]>([]);
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [searchText, setSearchText] = useState<string>('');

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (levelFilter !== 'all' && log.level !== levelFilter) {
        return false;
      }
      if (searchText.trim()) {
        return log.message.toLowerCase().includes(searchText.toLowerCase());
      }
      return true;
    });
  }, [logs, levelFilter, searchText]);

  const clearReconnectTimer = () => {
    if (reconnectTimerRef.current) {
      window.clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  };

  const closeWebSocket = () => {
    clearReconnectTimer();
    if (wsRef.current) {
      wsRef.current.onopen = null;
      wsRef.current.onclose = null;
      wsRef.current.onerror = null;
      wsRef.current.onmessage = null;
      wsRef.current.close();
      wsRef.current = null;
    }
  };

  const appendLog = (log: JsLogItem) => {
    setLogs((prev) => {
      const next = [...prev, log];
      if (next.length > DEFAULT_MAX_LOGS) {
        return next.slice(next.length - DEFAULT_MAX_LOGS);
      }
      return next;
    });
  };

  const parseMetroMessage = (event: MessageEvent): JsLogItem => {
    let level: JsLogItem['level'] = 'unknown';
    let message = '';
    let raw: unknown = event.data;

    try {
      const parsed = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      raw = parsed;

      // Metro logger 常见格式：{ level, data, type }
      if (parsed && typeof parsed === 'object') {
        const data = parsed as MetroLogMessage;
        if (typeof data.level === 'string') {
          level = data.level as LogLevel;
        }
        if (Array.isArray(data.data)) {
          message = (data.data as unknown[])
            .map((item: unknown) => {
              if (typeof item === 'string') {
                return item;
              }
              try {
                return JSON.stringify(item);
              } catch {
                return String(item);
              }
            })
            .join(' ');
        } else if (data.message != null) {
          message = String(data.message);
        } else {
          message = JSON.stringify(data);
        }
      } else {
        message = String(event.data);
      }
    } catch {
      message = String(event.data);
    }

    return {
      id: `${new Date().getTime()}-${Math.random().toString(16).slice(2)}`,
      timestamp: new Date().getTime(),
      level,
      message,
      raw,
    };
  };

  const connectWebSocket = () => {
    closeWebSocket();
    clearReconnectTimer();

    setIsConnecting(true);
    setIsConnected(false);

    try {
      const url = `ws://localhost:${port}${DEFAULT_METRO_LOGGER_PATH}`;
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnecting(false);
        setIsConnected(true);
        const timestamp = new Date().getTime();
        appendLog({
          id: `${Date.now()}-system-connected`,
          timestamp,
          level: 'info',
          message: `已连接到 Metro Logger: ${url}`,
          raw: null,
        });
      };

      ws.onmessage = (event) => {
        console.log(event, 'event');

        const logItem = parseMetroMessage(event);
        appendLog(logItem);
      };

      ws.onerror = () => {
        setIsConnecting(false);
        setIsConnected(false);
        const timestamp = new Date().getTime();
        appendLog({
          id: `${Date.now()}-system-error`,
          timestamp,
          level: 'error',
          message: '与 Metro Logger 通信发生错误',
          raw: null,
        });
      };

      ws.onclose = () => {
        setIsConnecting(false);
        setIsConnected(false);
        const timestamp = new Date().getTime();
        appendLog({
          id: `${Date.now()}-system-closed`,
          timestamp,
          level: 'warn',
          message: '与 Metro Logger 的连接已断开，将尝试重连...',
          raw: null,
        });

        clearReconnectTimer();
        reconnectTimerRef.current = window.setTimeout(() => {
          connectWebSocket();
        }, DEFAULT_RECONNECT_DELAY);
      };
    } catch (error) {
      console.error(error);
      const timestamp = new Date().getTime();
      setIsConnecting(false);
      setIsConnected(false);
      appendLog({
        id: `${timestamp}-system-exception`,
        timestamp,
        level: 'error',
        message: `创建 WebSocket 连接失败: ${(error as Error).message}`,
        raw: error,
      });
    }
  };

  const handleConnectClick = () => {
    if (connectionMode !== 'websocket') {
      appendLog({
        id: `${Date.now()}-system-adb-not-impl`,
        timestamp: Date.now(),
        level: 'warn',
        message: '当前仅实现 WebSocket 方式抓取 JS 日志，ADB 模式暂未实现。',
        raw: null,
      });
      return;
    }
    connectWebSocket();
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  useEffect(() => {
    return () => {
      closeWebSocket();
    };
  }, []);

  return (
    <div className="rn-debug-logs">
      <Card className="rn-debug-logs-toolbar">
        <Space wrap size="middle" style={{ width: '100%' }}>
          <Space>
            <Text strong>连接状态：</Text>
            {isConnecting ? (
              <Space>
                <Spin size="small" />
                <Text type="secondary">连接中...</Text>
              </Space>
            ) : (
              <Badge
                status={isConnected ? 'success' : 'error'}
                text={isConnected ? '已连接' : '未连接'}
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
                if (typeof value === 'number') {
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
                {isConnected ? '重连' : '连接'}
              </Button>
            </Tooltip>

            <Tooltip title="清除日志">
              <Button icon={<ClearOutlined />} onClick={handleClearLogs}>
                清除
              </Button>
            </Tooltip>
          </Space>

          <Space style={{ marginLeft: 'auto' }}>
            <Select
              placeholder="日志级别"
              value={levelFilter}
              style={{ width: '100px' }}
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
              <DisconnectOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
              <Text type="secondary">
                {isConnected
                  ? '已连接，等待日志输出...'
                  : '未连接，请点击连接按钮连接到 Metro bundler'}
              </Text>
              <Text type="secondary" style={{ fontSize: '12px', marginTop: 8 }}>
                默认端口: {DEFAULT_PORT}
              </Text>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className="rn-debug-logs-item"
                data-level={log.level === 'unknown' ? undefined : log.level}
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
