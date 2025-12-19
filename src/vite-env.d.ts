/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 应用标题 */
  readonly VITE_APP_TITLE: string;
  /** 应用环境：development | production */
  readonly VITE_APP_ENV: "development" | "production";
  /** 是否开启调试模式 */
  readonly VITE_APP_DEBUG: string;

  /** API 基础 URL */
  readonly VITE_API_BASE_URL: string;
  /** API 请求超时时间（毫秒） */
  readonly VITE_API_TIMEOUT: string;

  /** WebSocket URL */
  readonly VITE_WS_URL: string;

  /** Socket.io URL */
  readonly VITE_SOCKET_URL: string;

  /** Metro Logger 端口 */
  readonly VITE_METRO_LOGGER_PORT: string;
  /** Metro Logger 路径 */
  readonly VITE_METRO_LOGGER_PATH: string;

  /** 开发服务器端口 */
  readonly VITE_PORT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
