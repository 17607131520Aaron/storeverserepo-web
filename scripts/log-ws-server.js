/**
 * 简单的日志 WebSocket 服务器
 * 用于接收 React Native 应用发送的日志，并转发给连接的 web 客户端
 *
 * 使用方法：
 * node scripts/log-ws-server.js
 * 或
 * node scripts/log-ws-server.js --port 8082
 *
 * 注意：由于 package.json 设置了 "type": "module"，
 * 需要使用 node --input-type=commonjs scripts/log-ws-server.js
 * 或者在 package.json 中使用 log-server 脚本
 */

// 注意：由于 package.json 设置了 "type": "module"，这里使用 ES modules
import http from "http";
import { WebSocketServer, WebSocket } from "ws";

const PORT = process.argv.includes("--port")
  ? parseInt(process.argv[process.argv.indexOf("--port") + 1]) || 8082
  : 8082;

const server = http.createServer();
const wss = new WebSocketServer({
  server,
  path: "/logs",
  clientTracking: true,
});

const clients = new Set();

wss.on("connection", (ws, req) => {
  const clientId = `${req.socket.remoteAddress}:${req.socket.remotePort}`;
  clients.add(ws);

  console.log(`[Log Server] 客户端连接: ${clientId}，当前连接数: ${clients.size}`);

  // 发送欢迎消息
  ws.send(
    JSON.stringify({
      type: "system",
      message: "已连接到日志服务器",
      timestamp: new Date().toISOString(),
    }),
  );

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message.toString());

      // 如果是日志消息，广播给所有客户端（除了发送者）
      if (data.type === "js-log") {
        console.log(`[Log Server] 收到日志: [${data.level}] ${data.message.substring(0, 50)}...`);

        // 广播给所有客户端
        clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            try {
              client.send(message.toString());
            } catch (error) {
              console.error("[Log Server] 广播消息失败:", error);
            }
          }
        });
      } else {
        // 其他类型的消息，也广播
        clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            try {
              client.send(message.toString());
            } catch (error) {
              console.error("[Log Server] 广播消息失败:", error);
            }
          }
        });
      }
    } catch (error) {
      console.error("[Log Server] 解析消息失败:", error, message.toString());
    }
  });

  ws.on("close", () => {
    clients.delete(ws);
    console.log(`[Log Server] 客户端断开: ${clientId}，当前连接数: ${clients.size}`);
  });

  ws.on("error", (error) => {
    console.error(`[Log Server] WebSocket 错误 (${clientId}):`, error);
    clients.delete(ws);
  });
});

server.listen(PORT, () => {
  console.log(`[Log Server] WebSocket 服务器已启动`);
  console.log(`[Log Server] 监听地址: ws://localhost:${PORT}/logs`);
  console.log(`[Log Server] 等待客户端连接...`);
});

// 优雅关闭
process.on("SIGINT", () => {
  console.log("\n[Log Server] 正在关闭服务器...");
  wss.close(() => {
    server.close(() => {
      console.log("[Log Server] 服务器已关闭");
      process.exit(0);
    });
  });
});
