/**
 * useSocket Hook
 * 通用 Socket 连接管理，整合连接、事件监听、消息发送功能
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import { io } from 'socket.io-client';

import type { SocketOptions as IOSocketOptions, ManagerOptions, Socket } from 'socket.io-client';

/** 连接状态 */
export type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error';

/** Socket 配置选项 */
export interface UseSocketOptions {
  /** 服务器 URL */
  url: string;
  /** Socket.io 路径 */
  path?: string;
  /** 是否自动连接，默认 true */
  autoConnect?: boolean;
  /** 是否启用重连，默认 true */
  reconnection?: boolean;
  /** 重连尝试次数，默认 3 */
  reconnectionAttempts?: number;
  /** 重连延迟（毫秒），默认 1000 */
  reconnectionDelay?: number;
  /** 连接超时（毫秒），默认 20000 */
  timeout?: number;
  /** 认证信息 */
  auth?: Record<string, unknown>;
  /** 查询参数 */
  query?: Record<string, string>;
  /** 额外请求头 */
  extraHeaders?: Record<string, string>;
}

/** Emit 结果 */
export interface EmitResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/** useSocket 返回值 */
export interface UseSocketReturn {
  /** Socket 实例 */
  socket: Socket | null;
  /** 是否已连接 */
  isConnected: boolean;
  /** 是否正在连接 */
  isConnecting: boolean;
  /** 错误信息 */
  error: Error | null;
  /** 连接状态 */
  connectionState: ConnectionState;
  /** 手动连接 */
  connect: () => void;
  /** 手动断开 */
  disconnect: () => void;
  /** 监听事件 */
  on: <T = unknown>(event: string, callback: (data: T) => void) => () => void;
  /** 取消监听 */
  off: (event: string, callback?: (...args: unknown[]) => void) => void;
  /** 发送消息 */
  emit: (event: string, data?: unknown) => void;
  /** 发送消息（带确认） */
  emitWithAck: <T = unknown>(
    event: string,
    data?: unknown,
    timeout?: number,
  ) => Promise<EmitResult<T>>;
}

// Socket 实例缓存，实现连接复用
const socketCache = new Map<string, { socket: Socket; refCount: number }>();

/**
 * 通用 Socket Hook
 */
export function useSocket(options: UseSocketOptions): UseSocketReturn {
  const { url, autoConnect = true, ...socketOptions } = options;

  const [socket, setSocket] = useState<Socket | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [error, setError] = useState<Error | null>(null);

  const socketRef = useRef<Socket | null>(null);

  // 初始化 Socket
  useEffect(() => {
    // 检查缓存
    let cached = socketCache.get(url);

    if (cached) {
      cached.refCount += 1;
      socketRef.current = cached.socket;
    } else {
      // 创建新连接
      const newSocket = io(url, {
        autoConnect: false,
        reconnection: socketOptions.reconnection ?? true,
        reconnectionAttempts: socketOptions.reconnectionAttempts ?? 3,
        reconnectionDelay: socketOptions.reconnectionDelay ?? 1000,
        timeout: socketOptions.timeout ?? 20000,
        path: socketOptions.path,
        auth: socketOptions.auth,
        query: socketOptions.query,
        extraHeaders: socketOptions.extraHeaders,
      } as Partial<ManagerOptions & IOSocketOptions>);

      socketCache.set(url, { socket: newSocket, refCount: 1 });
      socketRef.current = newSocket;
      cached = socketCache.get(url);
    }

    // 使用 ref 而不是 state 来避免在 effect 中同步调用 setState
    const currentSocket = cached?.socket;
    if (currentSocket) {
      // 延迟设置 socket state，避免同步 setState
      setTimeout(() => {
        setSocket(currentSocket);
      }, 0);
    }

    if (!currentSocket) {
      return;
    }

    // 事件处理
    const handleConnect = () => {
      setConnectionState('connected');
      setError(null);
    };

    const handleDisconnect = () => {
      setConnectionState('disconnected');
    };

    const handleConnectError = (err: Error) => {
      setConnectionState('error');
      setError(err);
    };

    const handleReconnectAttempt = () => {
      setConnectionState('connecting');
    };

    currentSocket.on('connect', handleConnect);
    currentSocket.on('disconnect', handleDisconnect);
    currentSocket.on('connect_error', handleConnectError);
    currentSocket.io.on('reconnect_attempt', handleReconnectAttempt);

    // 检查当前状态或自动连接
    if (currentSocket.connected) {
      // 延迟设置状态
      setTimeout(() => {
        setConnectionState('connected');
      }, 0);
    } else if (autoConnect) {
      setTimeout(() => {
        setConnectionState('connecting');
      }, 0);
      currentSocket.connect();
    }

    // 清理
    return () => {
      currentSocket.off('connect', handleConnect);
      currentSocket.off('disconnect', handleDisconnect);
      currentSocket.off('connect_error', handleConnectError);
      currentSocket.io.off('reconnect_attempt', handleReconnectAttempt);

      const cache = socketCache.get(url);
      if (cache) {
        cache.refCount -= 1;
        if (cache.refCount <= 0) {
          cache.socket.disconnect();
          socketCache.delete(url);
        }
      }
    };
  }, [
    url,
    autoConnect,
    socketOptions.path,
    socketOptions.reconnection,
    socketOptions.reconnectionAttempts,
    socketOptions.reconnectionDelay,
    socketOptions.timeout,
    socketOptions.auth,
    socketOptions.query,
    socketOptions.extraHeaders,
  ]);

  // 手动连接
  const connect = useCallback(() => {
    if (socketRef.current && !socketRef.current.connected) {
      setConnectionState('connecting');
      socketRef.current.connect();
    }
  }, []);

  // 手动断开
  const disconnect = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.disconnect();
    }
  }, []);

  // 监听事件
  const on = useCallback(<T = unknown>(event: string, callback: (data: T) => void) => {
    if (!socketRef.current) {
      return () => {};
    }
    socketRef.current.on(event, callback as (...args: unknown[]) => void);
    return () => {
      socketRef.current?.off(event, callback as (...args: unknown[]) => void);
    };
  }, []);

  // 取消监听
  const off = useCallback((event: string, callback?: (...args: unknown[]) => void) => {
    if (!socketRef.current) {
      return;
    }
    if (callback) {
      socketRef.current.off(event, callback);
    } else {
      socketRef.current.off(event);
    }
  }, []);

  // 发送消息
  const emit = useCallback((event: string, data?: unknown) => {
    if (!socketRef.current?.connected) {
      console.warn(`[useSocket] Cannot emit "${event}": Socket not connected`);
      return;
    }
    socketRef.current.emit(event, data);
  }, []);

  // 发送消息（带确认）
  const emitWithAck = useCallback(
    <T = unknown>(event: string, data?: unknown, timeout = 5000): Promise<EmitResult<T>> => {
      return new Promise((resolve) => {
        if (!socketRef.current?.connected) {
          resolve({ success: false, error: 'Socket not connected' });
          return;
        }

        const timeoutId = setTimeout(() => {
          resolve({ success: false, error: `Timeout after ${timeout}ms` });
        }, timeout);

        socketRef.current.emit(event, data, (response: T) => {
          clearTimeout(timeoutId);
          resolve({ success: true, data: response });
        });
      });
    },
    [],
  );

  return {
    socket,
    isConnected: connectionState === 'connected',
    isConnecting: connectionState === 'connecting',
    error,
    connectionState,
    connect,
    disconnect,
    on,
    off,
    emit,
    emitWithAck,
  };
}
