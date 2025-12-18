# useSocket Hook 使用文档

## 目录

- [概述](#概述)
- [安装和导入](#安装和导入)
- [useSocket - WebSocket 连接](#usesocket---websocket-连接)
  - [基本用法](#基本用法)
  - [配置选项](#配置选项)
  - [返回值](#返回值)
  - [完整示例](#完整示例)
- [useSSE - Server-Sent Events 连接](#usesse---server-sent-events-连接)
  - [基本用法](#基本用法-1)
  - [配置选项](#配置选项-1)
  - [返回值](#返回值-1)
  - [完整示例](#完整示例-1)
- [API 参考](#api-参考)
  - [useSocket API](#usesocket-api)
  - [useSSE API](#usesse-api)
- [高级用法](#高级用法)
  - [连接复用机制](#连接复用机制)
  - [错误处理](#错误处理)
  - [类型安全](#类型安全)
  - [条件连接](#条件连接)
- [最佳实践](#最佳实践)
- [常见问题](#常见问题)
- [技术细节](#技术细节)

---

## 概述

`useSocket` 和 `useSSE` 是两个 React Hook，用于在 React 应用中管理实时通信连接。

- **useSocket**: 基于 Socket.io 的 WebSocket 连接，支持双向通信（客户端可以发送和接收消息）
- **useSSE**: 基于原生 EventSource 的 Server-Sent Events 连接，仅支持服务端推送（客户端只能接收消息）

### 特性

- ✅ 自动连接管理
- ✅ 连接状态追踪
- ✅ 自动重连机制（useSocket）
- ✅ 连接复用（useSocket）
- ✅ TypeScript 类型支持
- ✅ 事件监听和取消监听
- ✅ 带确认的消息发送（useSocket）
- ✅ 完整的错误处理

---

## 安装和导入

### 前置依赖

确保已安装 `socket.io-client`：

```bash
pnpm add socket.io-client
```

### 导入方式

```typescript
// 导入 Hook
import { useSocket, useSSE } from "@/hooks/useSocket";

// 导入类型
import type {
  UseSocketOptions,
  UseSocketReturn,
  UseSSEOptions,
  UseSSEReturn,
} from "@/hooks/useSocket";
```

---

## useSocket - WebSocket 连接

`useSocket` 基于 Socket.io 实现，适用于需要双向实时通信的场景，如聊天应用、实时协作、游戏等。

### 基本用法

```typescript
import { useSocket } from '@/hooks/useSocket';

function ChatComponent() {
  const {
    socket,
    isConnected,
    isConnecting,
    connectionState,
    error,
    connect,
    disconnect,
    on,
    off,
    emit,
    emitWithAck
  } = useSocket({
    url: 'ws://localhost:3000',
    autoConnect: true,
  });

  // 监听消息
  useEffect(() => {
    const unsubscribe = on('message', (data) => {
      console.log('收到消息:', data);
    });
    return unsubscribe; // 组件卸载时自动取消监听
  }, [on]);

  // 发送消息
  const handleSend = () => {
    emit('sendMessage', { text: 'Hello' });
  };

  return (
    <div>
      <p>状态: {connectionState}</p>
      {error && <p>错误: {error.message}</p>}
      <button onClick={handleSend} disabled={!isConnected}>
        发送消息
      </button>
    </div>
  );
}
```

### 配置选项

#### UseSocketOptions

| 属性                   | 类型                      | 默认值      | 说明                                                                          |
| ---------------------- | ------------------------- | ----------- | ----------------------------------------------------------------------------- |
| `url`                  | `string`                  | **必填**    | Socket.io 服务器 URL（如 `ws://localhost:3000` 或 `https://api.example.com`） |
| `path`                 | `string`                  | `undefined` | Socket.io 路径（如 `/socket.io`）                                             |
| `autoConnect`          | `boolean`                 | `true`      | 是否在组件挂载时自动连接                                                      |
| `reconnection`         | `boolean`                 | `true`      | 是否启用自动重连                                                              |
| `reconnectionAttempts` | `number`                  | `3`         | 最大重连尝试次数                                                              |
| `reconnectionDelay`    | `number`                  | `1000`      | 重连延迟（毫秒）                                                              |
| `timeout`              | `number`                  | `20000`     | 连接超时时间（毫秒）                                                          |
| `auth`                 | `Record<string, unknown>` | `undefined` | 认证信息，会在连接时发送给服务器                                              |
| `query`                | `Record<string, string>`  | `undefined` | 查询参数，会附加到连接 URL                                                    |
| `extraHeaders`         | `Record<string, string>`  | `undefined` | 额外的 HTTP 请求头                                                            |

#### 配置示例

```typescript
// 基础配置
const socket = useSocket({
  url: "ws://localhost:3000",
});

// 完整配置
const socket = useSocket({
  url: "https://api.example.com",
  path: "/socket.io",
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 2000,
  timeout: 30000,
  auth: {
    token: "your-auth-token",
    userId: "123",
  },
  query: {
    version: "1.0",
    platform: "web",
  },
  extraHeaders: {
    "X-Custom-Header": "value",
  },
});

// 手动控制连接
const socket = useSocket({
  url: "ws://localhost:3000",
  autoConnect: false, // 不自动连接
});

// 在需要时手动连接
useEffect(() => {
  if (shouldConnect) {
    socket.connect();
  }
}, [shouldConnect]);
```

### 返回值

#### UseSocketReturn

| 属性                                     | 类型                                                                             | 说明                                               |
| ---------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------- |
| `socket`                                 | `Socket \| null`                                                                 | Socket.io 客户端实例（可直接访问底层 API）         |
| `isConnected`                            | `boolean`                                                                        | 是否已连接（`connectionState === 'connected'`）    |
| `isConnecting`                           | `boolean`                                                                        | 是否正在连接（`connectionState === 'connecting'`） |
| `error`                                  | `Error \| null`                                                                  | 连接错误信息                                       |
| `connectionState`                        | `'connecting' \| 'connected' \| 'disconnected' \| 'error'`                       | 当前连接状态                                       |
| `connect()`                              | `() => void`                                                                     | 手动触发连接                                       |
| `disconnect()`                           | `() => void`                                                                     | 手动断开连接                                       |
| `on<T>(event, callback)`                 | `<T>(event: string, callback: (data: T) => void) => () => void`                  | 监听事件，返回取消监听的函数                       |
| `off(event, callback?)`                  | `(event: string, callback?: (...args: unknown[]) => void) => void`               | 取消监听事件                                       |
| `emit(event, data?)`                     | `(event: string, data?: unknown) => void`                                        | 发送消息（不等待响应）                             |
| `emitWithAck<T>(event, data?, timeout?)` | `<T>(event: string, data?: unknown, timeout?: number) => Promise<EmitResult<T>>` | 发送消息并等待确认（返回 Promise）                 |

### 完整示例

```typescript
import { useEffect, useState } from 'react';
import { useSocket } from '@/hooks/useSocket';

interface Message {
  id: string;
  text: string;
  userId: string;
  timestamp: number;
}

function ChatRoom() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [userId] = useState('user-' + Math.random().toString(36).substr(2, 9));

  const {
    isConnected,
    isConnecting,
    connectionState,
    error,
    connect,
    disconnect,
    on,
    emit,
    emitWithAck,
  } = useSocket({
    url: 'ws://localhost:3000',
    auth: {
      userId,
      token: localStorage.getItem('token'),
    },
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  // 监听新消息
  useEffect(() => {
    const unsubscribe = on<Message>('newMessage', (message) => {
      setMessages((prev) => [...prev, message]);
    });
    return unsubscribe;
  }, [on]);

  // 监听用户加入
  useEffect(() => {
    const unsubscribe = on<{ userId: string }>('userJoined', ({ userId }) => {
      console.log(`用户 ${userId} 加入了聊天室`);
    });
    return unsubscribe;
  }, [on]);

  // 发送消息
  const handleSendMessage = async () => {
    if (!inputText.trim() || !isConnected) return;

    const message: Omit<Message, 'id' | 'timestamp'> = {
      text: inputText,
      userId,
    };

    // 使用 emitWithAck 确保消息发送成功
    const result = await emitWithAck<Message>('sendMessage', message, 5000);

    if (result.success && result.data) {
      setMessages((prev) => [...prev, result.data!]);
      setInputText('');
    } else {
      console.error('发送失败:', result.error);
      alert('消息发送失败: ' + result.error);
    }
  };

  // 加入房间
  const handleJoinRoom = async () => {
    const result = await emitWithAck<{ roomId: string }>(
      'joinRoom',
      { roomId: 'room-123' },
      5000
    );

    if (result.success) {
      console.log('成功加入房间:', result.data);
    }
  };

  return (
    <div>
      <div>
        <p>连接状态: {connectionState}</p>
        {isConnecting && <p>正在连接...</p>}
        {error && <p style={{ color: 'red' }}>错误: {error.message}</p>}
        <button onClick={connect} disabled={isConnected || isConnecting}>
          连接
        </button>
        <button onClick={disconnect} disabled={!isConnected}>
          断开
        </button>
        <button onClick={handleJoinRoom} disabled={!isConnected}>
          加入房间
        </button>
      </div>

      <div>
        <h3>消息列表</h3>
        {messages.map((msg) => (
          <div key={msg.id}>
            <strong>{msg.userId}:</strong> {msg.text}
          </div>
        ))}
      </div>

      <div>
        <input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          disabled={!isConnected}
        />
        <button onClick={handleSendMessage} disabled={!isConnected}>
          发送
        </button>
      </div>
    </div>
  );
}
```

---

## useSSE - Server-Sent Events 连接

`useSSE` 基于原生 EventSource API 实现，适用于只需要服务端推送数据的场景，如实时通知、日志流、数据更新等。

### 基本用法

```typescript
import { useSSE } from '@/hooks/useSocket';

function NotificationComponent() {
  const {
    eventSource,
    isConnected,
    isConnecting,
    connectionState,
    error,
    connect,
    disconnect,
    on,
  } = useSSE({
    url: 'https://api.example.com/events',
    autoConnect: true,
  });

  // 监听默认 message 事件
  useEffect(() => {
    const unsubscribe = on('message', (event) => {
      const data = JSON.parse(event.data);
      console.log('收到通知:', data);
    });
    return unsubscribe;
  }, [on]);

  // 监听自定义事件
  useEffect(() => {
    const unsubscribe = on('notification', (event) => {
      const notification = JSON.parse(event.data);
      console.log('自定义通知:', notification);
    });
    return unsubscribe;
  }, [on]);

  return (
    <div>
      <p>状态: {connectionState}</p>
      {error && <p>错误: {error.message}</p>}
    </div>
  );
}
```

### 配置选项

#### UseSSEOptions

| 属性              | 类型      | 默认值   | 说明                                                   |
| ----------------- | --------- | -------- | ------------------------------------------------------ |
| `url`             | `string`  | **必填** | SSE 服务器 URL（完整地址，包含查询参数等）             |
| `autoConnect`     | `boolean` | `true`   | 是否在组件挂载时自动连接                               |
| `withCredentials` | `boolean` | `false`  | 是否携带跨域凭证（对应 `EventSource.withCredentials`） |

#### 配置示例

```typescript
// 基础配置
const sse = useSSE({
  url: "https://api.example.com/events",
});

// 带认证的配置（通过 URL 参数）
const sse = useSSE({
  url: "https://api.example.com/events?token=your-token&userId=123",
  autoConnect: true,
  withCredentials: true, // 如果需要发送 cookies
});

// 手动控制连接
const sse = useSSE({
  url: "https://api.example.com/events",
  autoConnect: false,
});

useEffect(() => {
  if (shouldConnect) {
    sse.connect();
  }
}, [shouldConnect]);
```

### 返回值

#### UseSSEReturn

| 属性                  | 类型                                                                     | 说明                                               |
| --------------------- | ------------------------------------------------------------------------ | -------------------------------------------------- |
| `eventSource`         | `EventSource \| null`                                                    | 原生 EventSource 实例（可直接访问底层 API）        |
| `isConnected`         | `boolean`                                                                | 是否已连接（`connectionState === 'connected'`）    |
| `isConnecting`        | `boolean`                                                                | 是否正在连接（`connectionState === 'connecting'`） |
| `error`               | `Error \| null`                                                          | 连接错误信息                                       |
| `connectionState`     | `'connecting' \| 'connected' \| 'disconnected' \| 'error'`               | 当前连接状态                                       |
| `connect()`           | `() => void`                                                             | 手动触发连接                                       |
| `disconnect()`        | `() => void`                                                             | 手动断开连接                                       |
| `on(event, callback)` | `(event: string, callback: (event: MessageEvent) => void) => () => void` | 监听事件，返回取消监听的函数                       |

### 完整示例

```typescript
import { useEffect, useState } from 'react';
import { useSSE } from '@/hooks/useSocket';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: number;
}

function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const token = localStorage.getItem('token');

  const {
    isConnected,
    isConnecting,
    connectionState,
    error,
    connect,
    disconnect,
    on,
  } = useSSE({
    url: `https://api.example.com/events?token=${token}`,
    autoConnect: true,
    withCredentials: true,
  });

  // 监听默认 message 事件
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = on('message', (event) => {
      try {
        const notification: Notification = JSON.parse(event.data);
        setNotifications((prev) => [notification, ...prev]);
      } catch (err) {
        console.error('解析消息失败:', err);
      }
    });

    return unsubscribe;
  }, [isConnected, on]);

  // 监听自定义 notification 事件
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = on('notification', (event) => {
      try {
        const notification: Notification = JSON.parse(event.data);
        setNotifications((prev) => [notification, ...prev]);
      } catch (err) {
        console.error('解析通知失败:', err);
      }
    });

    return unsubscribe;
  }, [isConnected, on]);

  // 监听 error 事件（SSE 特有）
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = on('error', (event) => {
      console.error('SSE 错误:', event);
    });

    return unsubscribe;
  }, [isConnected, on]);

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <div>
      <div>
        <p>连接状态: {connectionState}</p>
        {isConnecting && <p>正在连接...</p>}
        {error && <p style={{ color: 'red' }}>错误: {error.message}</p>}
        <button onClick={connect} disabled={isConnected || isConnecting}>
          连接
        </button>
        <button onClick={disconnect} disabled={!isConnected}>
          断开
        </button>
        <button onClick={clearNotifications}>清空通知</button>
      </div>

      <div>
        <h3>通知列表</h3>
        {notifications.length === 0 ? (
          <p>暂无通知</p>
        ) : (
          notifications.map((notif) => (
            <div key={notif.id} className={`notification-${notif.type}`}>
              <strong>{notif.title}</strong>
              <p>{notif.message}</p>
              <small>{new Date(notif.timestamp).toLocaleString()}</small>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
```

---

## API 参考

### useSocket API

#### `on<T>(event: string, callback: (data: T) => void): () => void`

监听 Socket.io 事件。

**参数：**

- `event`: 事件名称
- `callback`: 回调函数，接收事件数据

**返回：** 取消监听的函数

**示例：**

```typescript
const unsubscribe = on<Message>("message", (data) => {
  console.log("收到消息:", data);
});

// 取消监听
unsubscribe();
```

#### `off(event: string, callback?: (...args: unknown[]) => void): void`

取消监听 Socket.io 事件。

**参数：**

- `event`: 事件名称
- `callback`: 可选，要移除的特定回调函数。如果不提供，会移除该事件的所有监听器

**示例：**

```typescript
const handler = (data: Message) => {
  console.log(data);
};

on("message", handler);

// 移除特定监听器
off("message", handler);

// 移除所有监听器
off("message");
```

#### `emit(event: string, data?: unknown): void`

发送消息（不等待响应）。

**参数：**

- `event`: 事件名称
- `data`: 可选，要发送的数据

**注意：** 如果 Socket 未连接，会在控制台输出警告，但不会抛出错误。

**示例：**

```typescript
emit("sendMessage", { text: "Hello" });
emit("ping");
```

#### `emitWithAck<T>(event: string, data?: unknown, timeout?: number): Promise<EmitResult<T>>`

发送消息并等待服务器确认。

**参数：**

- `event`: 事件名称
- `data`: 可选，要发送的数据
- `timeout`: 可选，超时时间（毫秒），默认 5000

**返回：** Promise，解析为 `EmitResult<T>`

**EmitResult 结构：**

```typescript
interface EmitResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

**示例：**

```typescript
const result = await emitWithAck<{ messageId: string }>("sendMessage", { text: "Hello" }, 5000);

if (result.success) {
  console.log("消息 ID:", result.data?.messageId);
} else {
  console.error("发送失败:", result.error);
}
```

### useSSE API

#### `on(event: string, callback: (event: MessageEvent) => void): () => void`

监听 SSE 事件。

**参数：**

- `event`: 事件名称
  - `'message'`: 默认事件，服务端发送 `data:` 行时触发
  - 自定义事件：服务端通过 `event: xxx` 推送时触发
- `callback`: 回调函数，接收原生 `MessageEvent` 对象

**返回：** 取消监听的函数

**MessageEvent 属性：**

- `data`: 消息数据（字符串）
- `lastEventId`: 最后的事件 ID
- `origin`: 源 URL
- `type`: 事件类型

**示例：**

```typescript
// 监听默认 message 事件
const unsubscribe = on("message", (event) => {
  const data = JSON.parse(event.data);
  console.log("收到数据:", data);
});

// 监听自定义事件
const unsubscribe2 = on("notification", (event) => {
  const notification = JSON.parse(event.data);
  console.log("收到通知:", notification);
});

// 取消监听
unsubscribe();
unsubscribe2();
```

---

## 高级用法

### 连接复用机制

`useSocket` 实现了连接复用机制。当多个组件使用相同的 `url` 时，它们会共享同一个 Socket 连接，减少资源消耗。

**工作原理：**

- 使用 `socketCache` Map 存储 Socket 实例
- 以 `url` 作为 key
- 使用引用计数（`refCount`）跟踪使用该连接的组件数量
- 当所有组件卸载时，自动断开连接并清理缓存

**示例：**

```typescript
// 组件 A
function ComponentA() {
  const socket = useSocket({ url: "ws://localhost:3000" });
  // 创建新连接
}

// 组件 B（同时挂载）
function ComponentB() {
  const socket = useSocket({ url: "ws://localhost:3000" });
  // 复用组件 A 的连接，不会创建新连接
}

// 当组件 A 和 B 都卸载时，连接才会断开
```

**注意事项：**

- 只有 `url` 相同的连接才会复用
- 其他配置项（如 `auth`、`query`）不同时，仍会创建新连接
- 如果需要不同的配置，请使用不同的 `url`（如添加查询参数）

### 错误处理

#### useSocket 错误处理

```typescript
function MyComponent() {
  const { error, connectionState, isConnected } = useSocket({
    url: 'ws://localhost:3000',
  });

  useEffect(() => {
    if (error) {
      console.error('连接错误:', error);
      // 可以在这里实现错误上报、用户提示等
    }
  }, [error]);

  useEffect(() => {
    if (connectionState === 'error') {
      // 连接失败，可以显示错误提示
      console.log('连接失败，请检查网络或服务器状态');
    }
  }, [connectionState]);

  return (
    <div>
      {error && (
        <div className="error">
          连接错误: {error.message}
          <button onClick={() => window.location.reload()}>
            重试
          </button>
        </div>
      )}
    </div>
  );
}
```

#### useSSE 错误处理

```typescript
function MyComponent() {
  const { error, connectionState, on } = useSSE({
    url: 'https://api.example.com/events',
  });

  useEffect(() => {
    if (error) {
      console.error('SSE 错误:', error);
    }
  }, [error]);

  // SSE 的错误事件监听
  useEffect(() => {
    const unsubscribe = on('error', (event) => {
      console.error('SSE 事件错误:', event);
    });
    return unsubscribe;
  }, [on]);

  return (
    <div>
      {error && <div>连接错误: {error.message}</div>}
      {connectionState === 'error' && (
        <div>连接失败，EventSource 已关闭</div>
      )}
    </div>
  );
}
```

### 类型安全

#### 定义事件类型

```typescript
// types/socket.ts
export interface ServerEvents {
  message: { text: string; userId: string };
  userJoined: { userId: string; username: string };
  userLeft: { userId: string };
}

export interface ClientEvents {
  sendMessage: { text: string };
  joinRoom: { roomId: string };
  leaveRoom: { roomId: string };
}

// 使用
function ChatComponent() {
  const { on, emit } = useSocket({
    url: "ws://localhost:3000",
  });

  useEffect(() => {
    const unsubscribe = on<ServerEvents["message"]>("message", (data) => {
      // data 类型为 { text: string; userId: string }
      console.log(data.text, data.userId);
    });
    return unsubscribe;
  }, [on]);

  const handleSend = () => {
    emit<ClientEvents["sendMessage"]>("sendMessage", {
      text: "Hello",
    });
  };
}
```

#### 使用 emitWithAck 的类型

```typescript
interface SendMessageResponse {
  messageId: string;
  timestamp: number;
}

function ChatComponent() {
  const { emitWithAck } = useSocket({
    url: "ws://localhost:3000",
  });

  const handleSend = async () => {
    const result = await emitWithAck<SendMessageResponse>("sendMessage", { text: "Hello" });

    if (result.success && result.data) {
      // result.data 类型为 SendMessageResponse
      console.log("消息 ID:", result.data.messageId);
    }
  };
}
```

### 条件连接

#### 基于用户认证状态

```typescript
function ConditionalSocket() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const token = localStorage.getItem('token');

  const socket = useSocket({
    url: 'ws://localhost:3000',
    autoConnect: false, // 不自动连接
    auth: token ? { token } : undefined,
  });

  useEffect(() => {
    if (isAuthenticated && token) {
      socket.connect();
    } else {
      socket.disconnect();
    }
  }, [isAuthenticated, token]);

  return <div>...</div>;
}
```

#### 基于路由或权限

```typescript
import { useLocation } from 'react-router-dom';

function RouteBasedSocket() {
  const location = useLocation();
  const shouldConnect = location.pathname.startsWith('/chat');

  const socket = useSocket({
    url: 'ws://localhost:3000',
    autoConnect: false,
  });

  useEffect(() => {
    if (shouldConnect) {
      socket.connect();
    } else {
      socket.disconnect();
    }
  }, [shouldConnect]);

  return <div>...</div>;
}
```

---

## 最佳实践

### 1. 在 useEffect 中管理事件监听

```typescript
// ✅ 正确：在 useEffect 中监听，组件卸载时自动清理
useEffect(() => {
  const unsubscribe = on("message", (data) => {
    console.log(data);
  });
  return unsubscribe;
}, [on]);

// ❌ 错误：直接在组件函数体中监听，可能导致内存泄漏
on("message", (data) => {
  console.log(data);
});
```

### 2. 检查连接状态再发送消息

```typescript
// ✅ 正确：检查连接状态
const handleSend = () => {
  if (!isConnected) {
    alert("未连接，无法发送消息");
    return;
  }
  emit("sendMessage", { text: "Hello" });
};

// ❌ 错误：不检查状态（虽然不会报错，但消息会丢失）
const handleSend = () => {
  emit("sendMessage", { text: "Hello" });
};
```

### 3. 使用 emitWithAck 处理重要消息

```typescript
// ✅ 正确：重要消息使用 emitWithAck
const handleSendImportantMessage = async () => {
  const result = await emitWithAck("sendMessage", { text: "Important" });
  if (!result.success) {
    // 处理失败情况
    alert("发送失败: " + result.error);
  }
};

// ⚠️ 一般消息可以使用 emit
const handleSendNormalMessage = () => {
  emit("sendMessage", { text: "Normal" });
};
```

### 4. 避免在依赖数组中包含回调函数

```typescript
// ✅ 正确：使用 useCallback 稳定回调函数
const handleMessage = useCallback((data: Message) => {
  console.log(data);
}, []);

useEffect(() => {
  const unsubscribe = on("message", handleMessage);
  return unsubscribe;
}, [on, handleMessage]);

// ⚠️ 或者直接在 useEffect 中定义回调
useEffect(() => {
  const unsubscribe = on("message", (data: Message) => {
    console.log(data);
  });
  return unsubscribe;
}, [on]);
```

### 5. 处理连接状态变化

```typescript
function MyComponent() {
  const { connectionState, isConnected, error } = useSocket({
    url: "ws://localhost:3000",
  });

  useEffect(() => {
    switch (connectionState) {
      case "connected":
        console.log("已连接");
        // 连接成功后的操作，如获取历史消息
        break;
      case "disconnected":
        console.log("已断开");
        // 断开后的清理操作
        break;
      case "error":
        console.log("连接错误");
        // 错误处理
        break;
      case "connecting":
        console.log("连接中...");
        break;
    }
  }, [connectionState]);
}
```

### 6. 使用自定义 Hook 封装业务逻辑

```typescript
// hooks/useChatSocket.ts
function useChatSocket(roomId: string) {
  const [messages, setMessages] = useState<Message[]>([]);

  const socket = useSocket({
    url: "ws://localhost:3000",
    auth: {
      token: localStorage.getItem("token"),
    },
  });

  // 监听消息
  useEffect(() => {
    const unsubscribe = socket.on<Message>("message", (message) => {
      setMessages((prev) => [...prev, message]);
    });
    return unsubscribe;
  }, [socket.on]);

  // 加入房间
  useEffect(() => {
    if (socket.isConnected) {
      socket.emit("joinRoom", { roomId });
    }
  }, [socket.isConnected, roomId]);

  const sendMessage = useCallback(
    (text: string) => {
      socket.emit("sendMessage", { roomId, text });
    },
    [socket.emit, roomId],
  );

  return {
    messages,
    sendMessage,
    ...socket,
  };
}

// 使用
function ChatRoom({ roomId }: { roomId: string }) {
  const { messages, sendMessage, isConnected } = useChatSocket(roomId);
  // ...
}
```

---

## 常见问题

### Q1: 为什么连接后立即断开？

**可能原因：**

1. 服务器 URL 不正确
2. 服务器未运行或无法访问
3. 认证失败
4. CORS 配置问题

**解决方案：**

```typescript
const socket = useSocket({
  url: "ws://localhost:3000",
});

useEffect(() => {
  if (socket.error) {
    console.error("连接错误:", socket.error);
  }
}, [socket.error]);
```

### Q2: 如何实现断线重连？

`useSocket` 已内置自动重连机制，默认启用。可以通过配置项调整：

```typescript
const socket = useSocket({
  url: "ws://localhost:3000",
  reconnection: true, // 启用重连
  reconnectionAttempts: 5, // 最多重连 5 次
  reconnectionDelay: 2000, // 每次重连延迟 2 秒
});
```

### Q3: 多个组件使用同一个 URL，会创建多个连接吗？

不会。`useSocket` 实现了连接复用机制，相同 URL 的连接会被复用。

### Q4: 如何在连接断开时显示提示？

```typescript
function MyComponent() {
  const { connectionState, isConnected } = useSocket({
    url: 'ws://localhost:3000',
  });

  return (
    <div>
      {!isConnected && connectionState === 'disconnected' && (
        <div>连接已断开</div>
      )}
      {connectionState === 'connecting' && (
        <div>正在连接...</div>
      )}
    </div>
  );
}
```

### Q5: emitWithAck 超时了怎么办？

`emitWithAck` 会在超时时返回 `{ success: false, error: 'Timeout after ...ms' }`。你可以：

```typescript
const result = await emitWithAck("sendMessage", data, 10000); // 10 秒超时

if (!result.success) {
  if (result.error?.includes("Timeout")) {
    // 超时处理
    console.log("请求超时，请重试");
  } else {
    // 其他错误
    console.log("发送失败:", result.error);
  }
}
```

### Q6: SSE 连接会自动重连吗？

是的，`EventSource` API 本身支持自动重连。`useSSE` 会跟踪连接状态，但重连逻辑由浏览器实现。

### Q7: 如何在 SSR 环境中使用？

两个 Hook 都检查了 `typeof window === 'undefined'`，在服务端渲染时不会创建连接。

```typescript
// 在 Next.js 等 SSR 框架中使用
function MyComponent() {
  const socket = useSocket({
    url: "ws://localhost:3000",
    autoConnect: typeof window !== "undefined", // 只在客户端连接
  });
}
```

### Q8: 如何发送二进制数据？

Socket.io 支持二进制数据，可以直接传递：

```typescript
const file = new File(["content"], "file.txt");
emit("uploadFile", file);

// 或使用 ArrayBuffer
const buffer = new ArrayBuffer(8);
emit("sendBuffer", buffer);
```

---

## 技术细节

### useSocket 实现细节

1. **连接缓存机制**
   - 使用 `socketCache` Map 存储 Socket 实例
   - 引用计数管理连接生命周期
   - 所有使用相同 URL 的组件共享连接

2. **状态管理**
   - 使用 `useState` 管理连接状态和错误
   - 使用 `useRef` 存储 Socket 实例引用，避免 effect 依赖问题
   - 延迟设置 state，避免同步 setState 警告

3. **事件清理**
   - 在 `useEffect` 清理函数中移除所有事件监听器
   - 当引用计数为 0 时断开连接并清理缓存

4. **重连机制**
   - 由 Socket.io 客户端内置实现
   - 通过配置项控制重连行为

### useSSE 实现细节

1. **EventSource 管理**
   - 使用 `useRef` 存储 EventSource 实例
   - 在实例上挂载清理函数，统一管理事件监听器

2. **状态跟踪**
   - 监听 `open` 和 `error` 事件更新状态
   - 根据 `readyState` 判断连接状态

3. **自动重连**
   - EventSource API 本身支持自动重连
   - Hook 只负责状态跟踪和错误处理

4. **事件监听**
   - 支持默认 `message` 事件和自定义事件
   - 返回取消监听函数，方便清理

---

## 总结

`useSocket` 和 `useSSE` 提供了简单易用的 API 来管理实时通信连接。选择合适的 Hook：

- **使用 useSocket**：需要双向通信（发送和接收消息）
- **使用 useSSE**：只需要服务端推送数据

遵循最佳实践，可以构建稳定可靠的实时应用。

如有问题或建议，请参考代码实现或提交 Issue。
