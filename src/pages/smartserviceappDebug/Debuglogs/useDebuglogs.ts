import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useWebSocket } from "@/hooks/useSocket";

import {
  DEFAULT_MAX_LOGS,
  DEFAULT_METRO_LOGGER_PATH,
  DEFAULT_PORT,
  DEFAULT_RECONNECT_DELAY,
} from "./constants";

export type ConnectionMode = "adb" | "websocket";

export type LogLevel = "log" | "info" | "warn" | "error" | "debug";

export interface IJsLogItem {
  id: string;
  timestamp: number;
  level: LogLevel | "unknown";
  message: string;
  raw: unknown;
}

interface IMetroLogMessage {
  level?: string;
  data?: unknown[];
  message?: unknown;
  [key: string]: unknown;
}

export const useDebuglogs = (): {
  port: number;
  setPort: React.Dispatch<React.SetStateAction<number>>;
  connectionMode: ConnectionMode;
  setConnectionMode: React.Dispatch<React.SetStateAction<ConnectionMode>>;
  isConnecting: boolean;
  isConnected: boolean;
  logs: IJsLogItem[];
  levelFilter: string;
  setLevelFilter: React.Dispatch<React.SetStateAction<string>>;
  searchText: string;
  setSearchText: React.Dispatch<React.SetStateAction<string>>;
  filteredLogs: IJsLogItem[];
  handleConnectClick: () => void;
  handleClearLogs: () => void;
} => {
  const [port, setPort] = useState<number>(DEFAULT_PORT);
  const [connectionMode, setConnectionMode] = useState<ConnectionMode>("websocket");
  const [logs, setLogs] = useState<IJsLogItem[]>([]);
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [searchText, setSearchText] = useState<string>("");
  const [shouldConnect, setShouldConnect] = useState(false);

  // 构建 WebSocket URL
  const wsUrl = useMemo(() => {
    if (!shouldConnect) {
      return "";
    }
    return `ws://localhost:${port}${DEFAULT_METRO_LOGGER_PATH}`;
  }, [port, shouldConnect]);

  // 用于记录是否已经记录过连接日志，避免重复记录
  const hasLoggedConnectionRef = useRef(false);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (levelFilter !== "all" && log.level !== levelFilter) {
        return false;
      }
      if (searchText.trim()) {
        return log.message.toLowerCase().includes(searchText.toLowerCase());
      }
      return true;
    });
  }, [logs, levelFilter, searchText]);

  const appendLog = useCallback((log: IJsLogItem) => {
    setLogs((prev) => {
      const next = [...prev, log];
      if (next.length > DEFAULT_MAX_LOGS) {
        return next.slice(next.length - DEFAULT_MAX_LOGS);
      }
      return next;
    });
  }, []);

  const parseMetroMessage = useCallback((data: unknown): IJsLogItem => {
    let level: IJsLogItem["level"] = "unknown";
    let message = "";
    let raw: unknown = data;

    try {
      // 如果已经是对象，直接使用；否则尝试解析
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      raw = parsed;

      // Metro logger 常见格式：{ level, data, type }
      if (parsed && typeof parsed === "object") {
        const metroData = parsed as IMetroLogMessage;
        if (typeof metroData.level === "string") {
          level = metroData.level as LogLevel;
        }
        if (Array.isArray(metroData.data)) {
          message = (metroData.data as unknown[])
            .map((item: unknown) => {
              if (typeof item === "string") {
                return item;
              }
              try {
                return JSON.stringify(item);
              } catch {
                return String(item);
              }
            })
            .join(" ");
        } else if (metroData.message !== null) {
          message = String(metroData.message);
        } else {
          message = JSON.stringify(metroData);
        }
      } else {
        message = String(data);
      }
    } catch {
      message = String(data);
    }

    return {
      id: `${new Date().getTime()}-${Math.random().toString(16).slice(2)}`,
      timestamp: new Date().getTime(),
      level,
      message,
      raw,
    };
  }, []);

  // 使用 WebSocket hook，充分利用其回调功能
  const { isConnected, isConnecting, error, connect, disconnect } = useWebSocket({
    url: wsUrl,
    autoConnect: false,
    reconnect: true,
    reconnectInterval: DEFAULT_RECONNECT_DELAY,
    parseJSON: true, // 自动解析 JSON
    onOpen: useCallback(
      (_event: Event) => {
        hasLoggedConnectionRef.current = true;
        const timestamp = new Date().getTime();
        appendLog({
          id: `${timestamp}-system-connected`,
          timestamp,
          level: "info",
          message: `已连接到 Metro Logger: ${wsUrl}`,
          raw: null,
        });
      },
      [wsUrl, appendLog],
    ),
    onClose: useCallback(
      (event: CloseEvent) => {
        hasLoggedConnectionRef.current = false;
        const timestamp = new Date().getTime();
        appendLog({
          id: `${timestamp}-system-closed`,
          timestamp,
          level: "warn",
          message: `与 Metro Logger 的连接已断开${event.reason ? `: ${event.reason}` : ""}`,
          raw: { code: event.code, reason: event.reason, wasClean: event.wasClean },
        });
      },
      [appendLog],
    ),
    onError: useCallback(
      (event: Event) => {
        const timestamp = new Date().getTime();
        appendLog({
          id: `${timestamp}-system-error`,
          timestamp,
          level: "error",
          message: "与 Metro Logger 通信发生错误",
          raw: event,
        });
      },
      [appendLog],
    ),
    onMessage: useCallback(
      (event: MessageEvent) => {
        // event.data 已经是解析后的 JSON（因为 parseJSON: true）
        const logItem = parseMetroMessage(event.data);
        appendLog(logItem);
      },
      [parseMetroMessage, appendLog],
    ),
  });

  // 处理错误状态
  useEffect(() => {
    if (error && shouldConnect) {
      const timestamp = new Date().getTime();
      appendLog({
        id: `${timestamp}-system-error-state`,
        timestamp,
        level: "error",
        message: `WebSocket 错误: ${error.message}`,
        raw: error,
      });
    }
  }, [error, shouldConnect, appendLog]);

  const handleConnectClick = useCallback(() => {
    if (connectionMode !== "websocket") {
      appendLog({
        id: `${Date.now()}-system-adb-not-impl`,
        timestamp: Date.now(),
        level: "warn",
        message: "当前仅实现 WebSocket 方式抓取 JS 日志，ADB 模式暂未实现。",
        raw: null,
      });
      return;
    }

    if (isConnected) {
      // 重连：先断开，然后重新连接
      setShouldConnect(false);
      disconnect();
      // 等待断开完成后再重新连接
      setTimeout(() => {
        setShouldConnect(true);
        setTimeout(() => {
          connect();
        }, 0);
      }, 100);
    } else {
      setShouldConnect(true);
      // URL 更新后需要手动调用 connect（因为 autoConnect: false）
      setTimeout(() => {
        connect();
      }, 0);
    }
  }, [connectionMode, isConnected, appendLog, disconnect, connect]);

  const handleClearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  return {
    // 状态
    port,
    setPort,
    connectionMode,
    setConnectionMode,
    isConnecting,
    isConnected,
    logs,
    levelFilter,
    setLevelFilter,
    searchText,
    setSearchText,
    // 计算属性
    filteredLogs,
    // 方法
    handleConnectClick,
    handleClearLogs,
  };
};
