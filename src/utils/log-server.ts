/**
 * 简单的日志 WebSocket 服务器
 * 用于接收 React Native 应用发送的日志
 */

// let wsServer: WebSocketServer | null = null;
const clients = new Set<WebSocket>();

export interface ILogMessage {
  type: "js-log";
  level: string;
  message: string;
  timestamp: string;
  context?: unknown;
}

/**
 * 启动日志 WebSocket 服务器
 */
export function startLogServer(port: number = 8082): void {
  if (typeof window !== "undefined") {
    // 浏览器环境，无法启动服务器
    console.warn("[Log Server] 无法在浏览器环境中启动 WebSocket 服务器");
    return;
  }

  try {
    // 注意：这需要在 Node.js 环境中运行
    // 实际部署时，需要将 WebSocket 服务器集成到后端服务中
    console.log(`[Log Server] WebSocket 服务器应该运行在端口 ${port}`);
    console.log("[Log Server] 提示：请将日志服务器集成到后端服务中");
  } catch (error) {
    console.error("[Log Server] 启动失败:", error);
  }
}

/**
 * 广播日志消息给所有连接的客户端
 */
export function broadcastLog(log: ILogMessage): void {
  const message = JSON.stringify(log);
  clients.forEach((client) => {
    if (client.readyState === 1) {
      // WebSocket.OPEN
      try {
        client.send(message);
      } catch (error) {
        console.error("[Log Server] 广播消息失败:", error);
      }
    }
  });
}

// 注意：实际实现需要在 Node.js 后端服务中完成
// 这里只是接口定义
