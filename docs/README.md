# 项目文档索引

欢迎查阅项目文档！本文档提供了项目中所有公共组件、Hooks、工具方法和类型定义的详细说明。

## 📚 文档结构

```
docs/
├── README.md                    # 文档索引（本文件）
├── components/                  # 公共组件文档
│   ├── ErrorBoundary.md
│   ├── ErrorReportingProvider.md
│   ├── LoadingFallback.md
│   ├── PerformanceMonitorWrapper.md
│   └── VirtualTable.md
├── hooks/                       # Hooks 文档
│   ├── useAuth.md
│   ├── usePerformanceMonitor.md
│   ├── useTableRequest.md
│   ├── useSocket.md
│   └── useTabs.md
├── utils/                       # 工具方法文档
│   ├── request.md
│   ├── indexedDBStorage.md
│   ├── StorageValue.md
│   └── errorReporter.md
└── types/                       # 类型定义文档
    ├── baseRequest.md
    ├── react-barcode.md
    └── react-virtualized.md
```

---

## 🧩 公共组件

| 组件                                                                   | 路径                                       | 说明                               |
| ---------------------------------------------------------------------- | ------------------------------------------ | ---------------------------------- |
| [ErrorBoundary](./components/ErrorBoundary.md)                         | `src/components/ErrorBoundary`             | React 错误边界组件，捕获子组件错误 |
| [ErrorReportingProvider](./components/ErrorReportingProvider.md)       | `src/components/ErrorReportingProvider`    | 全局错误监听提供者                 |
| [LoadingFallback](./components/LoadingFallback.md)                     | `src/components/LoadingFallback`           | 页面加载占位组件                   |
| [PerformanceMonitorWrapper](./components/PerformanceMonitorWrapper.md) | `src/components/PerformanceMonitorWrapper` | 性能监控包装器                     |
| [VirtualTable](./components/VirtualTable.md)                           | `src/components/VirtualTable`              | 虚拟滚动表格组件                   |

---

## 🪝 Hooks

| Hook                                                      | 路径                              | 说明                          |
| --------------------------------------------------------- | --------------------------------- | ----------------------------- |
| [useAuth](./hooks/useAuth.md)                             | `src/hooks/useAuth`               | 认证管理 Hook                 |
| [usePerformanceMonitor](./hooks/usePerformanceMonitor.md) | `src/hooks/usePerformanceMonitor` | 性能监控 Hook                 |
| [useTableRequest](./hooks/useTableRequest.md)             | `src/hooks/useTableRequest`       | 表格请求 Hook（解决竞态问题） |
| [useSocket](./hooks/useSocket.md)                         | `src/hooks/useSocket`             | WebSocket 连接 Hook           |
| [useTabs](./hooks/useTabs.md)                             | `src/app/TabsContext`             | 标签页管理 Hook               |

---

## 🛠️ 工具方法

| 工具                                            | 路径                            | 说明                                                 |
| ----------------------------------------------- | ------------------------------- | ---------------------------------------------------- |
| [request](./utils/request.md)                   | `src/utils/request.ts`          | HTTP 请求工具                                        |
| [indexedDBStorage](./utils/indexedDBStorage.md) | `src/utils/indexedDBStorage.ts` | IndexedDB 存储工具                                   |
| [StorageValue](./utils/StorageValue.md)         | `src/utils/StorageValue.ts`     | 本地存储工具（localStorage、sessionStorage、Cookie） |
| [errorReporter](./utils/errorReporter.md)       | `src/utils/errorReporter.ts`    | 错误上报工具                                         |

---

## 📝 类型定义

| 类型文件                                          | 路径                               | 说明         |
| ------------------------------------------------- | ---------------------------------- | ------------ |
| [baseRequest](./types/baseRequest.md)             | `src/types/baseRequest.d.ts`       | 请求相关类型 |
| [react-barcode](./types/react-barcode.md)         | `src/types/react-barcode.d.ts`     | 条码组件类型 |
| [react-virtualized](./types/react-virtualized.md) | `src/types/react-virtualized.d.ts` | 虚拟滚动类型 |

---

## 🚀 快速开始

### 1. 错误处理

```tsx
import ErrorBoundary from "@/components/ErrorBoundary";
import ErrorReportingProvider from "@/components/ErrorReportingProvider";

function App() {
  return (
    <ErrorReportingProvider>
      <ErrorBoundary scope="App">
        <YourApp />
      </ErrorBoundary>
    </ErrorReportingProvider>
  );
}
```

### 2. 表格列表请求

```tsx
import { useTableRequest } from "@/hooks/useTableRequest";
import { get } from "@/utils/request";
import VirtualTableComponent from "@/components/VirtualTable";

function TablePage() {
  const { data, loading } = useTableRequest({
    requestFn: async (params, signal) => {
      return get({
        url: "/api/list",
        data: params,
        cancelToken: signal ? { signal } : undefined,
      });
    },
    params: { page: 1, pageSize: 10 },
  });

  return (
    <VirtualTableComponent
      dataSource={data || []}
      loading={loading}
      // ...
    />
  );
}
```

### 3. 认证管理

```tsx
import useAuth from "@/hooks/useAuth";

function LoginPage() {
  const { login, logout, isAuthenticated } = useAuth();

  const handleLogin = async () => {
    const response = await loginAPI();
    await login(response.token, response.user);
  };

  return (
    <div>
      {isAuthenticated ? (
        <button onClick={logout}>退出登录</button>
      ) : (
        <LoginForm onLogin={handleLogin} />
      )}
    </div>
  );
}
```

---

## 📖 文档说明

每个文档都包含以下内容：

- **概述**: 组件/Hook/工具的功能和特性
- **安装和导入**: 如何安装依赖和导入
- **基本用法**: 简单的使用示例
- **API 参考**: 完整的 API 文档
- **功能说明**: 详细的功能说明
- **完整示例**: 实际使用场景的完整示例
- **最佳实践**: 推荐的使用方式
- **注意事项**: 需要注意的事项
- **相关文档**: 相关文档的链接

---

## 🔍 查找文档

### 按功能查找

- **错误处理**: [ErrorBoundary](./components/ErrorBoundary.md) | [ErrorReportingProvider](./components/ErrorReportingProvider.md) | [errorReporter](./utils/errorReporter.md)
- **数据请求**: [request](./utils/request.md) | [useTableRequest](./hooks/useTableRequest.md)
- **数据存储**: [StorageValue](./utils/StorageValue.md) | [indexedDBStorage](./utils/indexedDBStorage.md) | [useAuth](./hooks/useAuth.md)
- **性能监控**: [usePerformanceMonitor](./hooks/usePerformanceMonitor.md) | [PerformanceMonitorWrapper](./components/PerformanceMonitorWrapper.md)
- **表格组件**: [VirtualTable](./components/VirtualTable.md)
- **实时通信**: [useSocket](./hooks/useSocket.md)
- **标签页管理**: [useTabs](./hooks/useTabs.md)

### 按类型查找

- **组件**: 查看 [components](./components/) 目录
- **Hooks**: 查看 [hooks](./hooks/) 目录
- **工具方法**: 查看 [utils](./utils/) 目录
- **类型定义**: 查看 [types](./types/) 目录

---

## 💡 贡献指南

如果你发现文档有错误或需要补充，请：

1. 更新对应的文档文件
2. 确保示例代码可以运行
3. 保持文档格式一致
4. 添加必要的说明和注意事项

---

## 📞 获取帮助

如果遇到问题或需要帮助，请：

1. 查阅相关文档
2. 查看代码示例
3. 联系项目维护者

---

**最后更新**: 2025-01-XX
