import type { Socket } from "socket.io-client";
/** 连接状态 */
export type ConnectionState = "connecting" | "connected" | "disconnected" | "error";

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

/** SSE 配置选项 */
export interface UseSSEOptions {
  /** 服务器 URL（完整 SSE 地址，包含 query 等） */
  url: string;
  /** 是否自动连接，默认 true */
  autoConnect?: boolean;
  /**
   * 是否携带跨域凭证
   * 对应 EventSource.withCredentials
   */
  withCredentials?: boolean;
}

/** useSSE 返回值 */
export interface UseSSEReturn {
  /** EventSource 实例 */
  eventSource: EventSource | null;
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
  /**
   * 监听 SSE 事件
   * - 默认事件：`message`
   * - 自定义事件：服务端通过 `event: xxx` 推送
   */
  on: (event: string, callback: (event: MessageEvent) => void) => () => void;
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

/** Socket 实例缓存，实现连接复用 */
export const socketCache = new Map<string, { socket: Socket; refCount: number }>();
