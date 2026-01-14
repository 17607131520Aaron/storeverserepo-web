/**
 * 网络请求监控 Hook
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useWebSocket } from "@/hooks/useSocket";

import { DEFAULT_MAX_REQUESTS, DEFAULT_PORT, DEFAULT_RECONNECT_DELAY } from "./constants";
import type { INetworkRequest, INetworkMessage } from "./types";

export const useNetworkMonitor = (): {
  port: number;
  setPort: React.Dispatch<React.SetStateAction<number>>;
  isConnecting: boolean;
  isConnected: boolean;
  requests: INetworkRequest[];
  selectedRequest: INetworkRequest | null;
  setSelectedRequest: React.Dispatch<React.SetStateAction<INetworkRequest | null>>;
  isRecording: boolean;
  setIsRecording: React.Dispatch<React.SetStateAction<boolean>>;
  filteredRequests: INetworkRequest[];
  handleConnectClick: () => void;
  handleClearRequests: () => void;
  handleClose: () => void;
} => {
  const [port, setPort] = useState<number>(DEFAULT_PORT);
  const [requests, setRequests] = useState<INetworkRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<INetworkRequest | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(true);
  const [shouldConnect, setShouldConnect] = useState(false);
  const [connectRequestId, setConnectRequestId] = useState(0);

  // 构建 WebSocket URL
  // 使用 /logs 端点，与日志服务器共享连接
  const wsUrl = useMemo(() => {
    if (!shouldConnect) {
      return "";
    }
    const wsHost = import.meta.env.VITE_WS_URL
      ? new URL(import.meta.env.VITE_WS_URL).hostname
      : window.location.hostname;
    return `ws://${wsHost}:${port}/logs`;
  }, [port, shouldConnect]);

  // 请求映射，用于更新响应
  const requestsMapRef = useRef<Map<string, INetworkRequest>>(new Map());

  // 处理网络请求消息
  const handleNetworkMessage = useCallback(
    (event: MessageEvent) => {
      if (!isRecording) {
        return;
      }

      try {
        const data = typeof event.data === "string" ? event.data : String(event.data);
        const message: INetworkMessage = JSON.parse(data);

        if (message.type === "network-request") {
          // 提取所有数据，包括额外的配置信息
          const requestData = message.data as Record<string, unknown>;
          const request: INetworkRequest = {
            id: requestData.id as string,
            method: requestData.method as string,
            url: requestData.url as string,
            headers: (requestData.headers as Record<string, string>) || {},
            data: requestData.data,
            startTime: requestData.startTime as number,
            type: (requestData.type as string) || "xhr",
            completed: false,
            baseURL: requestData.baseURL as string | undefined,
            originalUrl: requestData.originalUrl as string | undefined,
            params: requestData.params,
            body: requestData.body,
            requestSize: requestData.requestSize as number | undefined,
            // 注意：额外的配置信息（如 credentials, mode, cache, withCredentials, timeout, responseType 等）
            // 会被保留在 request 对象中，但类型定义中可能没有这些字段
            // 如果需要在前端使用这些字段，可以扩展 INetworkRequest 类型定义
          };

          setRequests((prev) => {
            const next = [...prev, request];
            if (next.length > DEFAULT_MAX_REQUESTS) {
              return next.slice(next.length - DEFAULT_MAX_REQUESTS);
            }
            return next;
          });

          requestsMapRef.current.set(request.id, request);
        } else if (message.type === "network-response") {
          setRequests((prev) => {
            return prev.map((req) => {
              if (req.id === message.data.id) {
                const updated: INetworkRequest = {
                  ...req,
                  status: message.data.status,
                  responseHeaders: message.data.headers || {},
                  responseData: message.data.data,
                  endTime: message.data.endTime,
                  duration: message.data.endTime - req.startTime,
                  responseSize: message.data.size,
                  completed: true,
                };
                requestsMapRef.current.set(req.id, updated);
                return updated;
              }
              return req;
            });
          });
        } else if (message.type === "network-error") {
          setRequests((prev) => {
            return prev.map((req) => {
              if (req.id === message.data.id) {
                const updated: INetworkRequest = {
                  ...req,
                  error: message.data.error,
                  endTime: message.data.endTime,
                  duration: message.data.endTime - req.startTime,
                  completed: true,
                };
                requestsMapRef.current.set(req.id, updated);
                return updated;
              }
              return req;
            });
          });
        }
      } catch (error) {
        console.error("[NetworkMonitor] Failed to parse message:", error);
      }
    },
    [isRecording],
  );

  // 使用 WebSocket hook
  const { isConnected, isConnecting, connect, disconnect } = useWebSocket({
    url: wsUrl,
    autoConnect: false,
    reconnect: true,
    reconnectInterval: DEFAULT_RECONNECT_DELAY,
    parseJSON: false,
    onMessage: handleNetworkMessage,
  });

  // 连接/重连
  const handleConnectClick = useCallback(() => {
    if (isConnected) {
      // 重连
      disconnect();
      setTimeout(() => {
        setConnectRequestId((prev) => prev + 1);
        setShouldConnect(true);
      }, 100);
    } else {
      setShouldConnect(true);
      setConnectRequestId((prev) => prev + 1);
    }
  }, [isConnected, disconnect]);

  // 关闭连接
  const handleClose = useCallback(() => {
    setShouldConnect(false);
    disconnect();
  }, [disconnect]);

  // 清除所有请求
  const handleClearRequests = useCallback(() => {
    setRequests([]);
    requestsMapRef.current.clear();
    setSelectedRequest(null);
  }, []);

  // 过滤请求（可以根据需要添加更多过滤条件）
  const filteredRequests = useMemo(() => {
    return requests;
  }, [requests]);

  // 当 shouldConnect 变化时连接
  useEffect(() => {
    if (shouldConnect && wsUrl) {
      connect();
    }
  }, [shouldConnect, wsUrl, connectRequestId, connect]);

  return {
    port,
    setPort,
    isConnecting,
    isConnected,
    requests,
    selectedRequest,
    setSelectedRequest,
    isRecording,
    setIsRecording,
    filteredRequests,
    handleConnectClick,
    handleClearRequests,
    handleClose,
  };
};
