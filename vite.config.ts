import { resolve } from "path";

import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import stylelint from "vite-plugin-stylelint";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), "");

  // Lightning CSS 目标浏览器版本
  const lightningCssTargets: Record<string, number> = {
    chrome: 90,
    firefox: 88,
    safari: 14,
    edge: 90,
  };

  return {
    // 部署到 GitHub Pages 的子路径： https://17607131520Aaron.github.io/storeverserepo-web/
    base: "/storeverserepo-web/",
    plugins: [
      react(),
      stylelint({
        fix: true,
        include: ["src/**/*.{css,scss,sass}"],
        exclude: ["node_modules"],
        lintOnStart: false,
        cache: true,
      }),
    ],
    server: {
      port: Number(env.VITE_PORT) || 8000,
      open: true,
      host: "0.0.0.0",
      strictPort: false,
      cors: true,
      // 代理配置
      proxy: {
        // API 代理
        "/api": {
          target: env.VITE_API_BASE_URL || "http://localhost:3000",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
          configure: (proxy, _options) => {
            proxy.on("error", (err, _req, _res) => {
              console.log("proxy error", err);
            });
            proxy.on("proxyReq", (proxyReq, req, _res) => {
              console.log(`[${req.method}] ${req.url} -> ${proxyReq.path}`);
            });
          },
        },
        // WebSocket 代理
        "/socket.io": {
          target: env.VITE_SOCKET_URL || "http://localhost:3000",
          changeOrigin: true,
          ws: true,
          rewrite: (path) => path.replace(/^\/socket\.io/, "/socket.io"),
        },
        // Metro Logger 代理（用于调试）
        "/logs": {
          target: `http://localhost:${env.VITE_METRO_LOGGER_PORT || 8081}`,
          changeOrigin: true,
          ws: true,
          rewrite: (path) => path.replace(/^\/logs/, env.VITE_METRO_LOGGER_PATH || "/logs"),
        },
      },
    },
    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
      },
      // 优化模块解析
      extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json"],
    },
    // CSS 配置
    css: {
      // 预处理器选项
      preprocessorOptions: {
        scss: {
          // 全局 SCSS 变量和混入（可选）
          // additionalData: `@import "@/styles/variables.scss";`,
          // 静默废弃警告
          silenceDeprecations: ["legacy-js-api"],
        },
        sass: {
          // 静默废弃警告
          silenceDeprecations: ["legacy-js-api"],
        },
      },
      // PostCSS 配置（会自动读取 postcss.config.js）
      postcss: "./postcss.config.js",
      // Lightning CSS 配置（用于 CSS 压缩和转换）
      lightningcss: {
        targets: lightningCssTargets,
        // 错误处理：true 表示跳过无效 CSS 规则并发出警告，false 表示构建失败
        errorRecovery: true,
      },
      // CSS 模块配置
      modules: {
        // 生成类名的规则：localIdentName 在开发环境使用，hashPrefix 在生产环境使用
        generateScopedName: mode === "production" ? "[hash:base64:8]" : "[name]__[local]___[hash:base64:5]",
        // 哈希策略
        hashPrefix: "prefix",
        // 类名导出方式
        localsConvention: "camelCase",
      },
      // 开发环境启用 source map
      devSourcemap: true,
    },
    // 环境变量配置
    define: {
      // 定义全局常量
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version || "0.0.0"),
      __APP_ENV__: JSON.stringify(mode),
      __APP_BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    },
    // 依赖预构建优化
    optimizeDeps: {
      include: ["react", "react-dom", "react-router-dom", "antd", "@ant-design/icons", "axios", "dayjs", "lodash"],
      exclude: [],
    },
    build: {
      // 输出目录
      outDir: "dist",
      // 静态资源目录（仅用于未指定的资源）
      assetsDir: "",
      // 小于此阈值的导入或引用资源会被内联为 base64，以避免额外的 http 请求
      assetsInlineLimit: 4096,
      // 启用 CSS 代码拆分
      cssCodeSplit: true,
      // 构建后是否生成 source map 文件
      sourcemap: false,
      // 启用/禁用 gzip 压缩大小报告
      reportCompressedSize: false,
      // chunk 大小警告限制（单位 kb）
      chunkSizeWarningLimit: 1000,
      // 压缩配置
      minify: "terser",
      terserOptions: {
        compress: {
          // 生产环境移除 console 和 debugger
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ["console.log", "console.info"],
        },
        format: {
          // 删除注释
          comments: false,
        },
      },
      // Rolldown 打包配置（使用 advancedChunks 替代已废弃的 manualChunks）
      rollupOptions: {
        output: {
          // 高级分包配置（rolldown-vite 推荐方式）
          advancedChunks: {
            groups: [
              // React 核心库（最高优先级）
              {
                name: "vendor-react",
                test: /[\\/]node_modules[\\/](react|react-dom|react-router-dom)/,
                priority: 30,
              },
              // Ant Design 组件库
              {
                name: "vendor-antd",
                test: /[\\/]node_modules[\\/](antd|@ant-design[\\/])/,
                priority: 25,
              },
              // 图表库
              {
                name: "vendor-charts",
                test: /[\\/]node_modules[\\/](recharts|react-virtualized)/,
                priority: 24,
              },
              // Socket 相关
              {
                name: "vendor-socket",
                test: /[\\/]node_modules[\\/]socket\.io/,
                priority: 23,
              },
              // React Query
              {
                name: "vendor-query",
                test: /[\\/]node_modules[\\/]react-query/,
                priority: 22,
              },
              // 条码和二维码库
              {
                name: "vendor-barcode",
                test: /[\\/]node_modules[\\/](react-barcode|qrcode\.react)/,
                priority: 21,
              },
              // 工具库（lodash, dayjs, axios 等）
              {
                name: "vendor-utils",
                test: /[\\/]node_modules[\\/](lodash|dayjs|axios|js-cookie|ahooks|@uidotdev[\\/]usehooks)/,
                priority: 20,
              },
              // 其他第三方库（优先级较低，作为兜底）
              {
                name: "vendor",
                test: /[\\/]node_modules/,
                priority: 10,
              },
              // 所有页面代码打包成一个文件
              {
                name: "pages",
                test: /[\\/]src[\\/]pages/,
                priority: 15,
              },
              // Hooks 单独打包
              {
                name: "hooks",
                test: /[\\/]src[\\/]hooks/,
                priority: 12,
              },
              // Router 单独打包
              {
                name: "router",
                test: /[\\/]src[\\/]router/,
                priority: 12,
              },
              // 公共代码（被多个入口共享，且大小超过 10KB）
              {
                name: "common",
                minShareCount: 2,
                minSize: 10000,
                priority: 5,
              },
            ],
          },
          // 输出文件命名
          chunkFileNames: (chunkInfo) => {
            const facadeModuleId = chunkInfo.facadeModuleId
              ? chunkInfo.facadeModuleId
                  .split("/")
                  .pop()
                  ?.replace(/\.[^.]*$/, "") || "chunk"
              : "chunk";
            return `js/${facadeModuleId}-[hash].js`;
          },
          entryFileNames: "js/[name]-[hash].js",
          assetFileNames: (assetInfo) => {
            if (!assetInfo.name) {
              return `[name]-[hash][extname]`;
            }
            const info = assetInfo.name.split(".");
            const ext = info[info.length - 1];
            // CSS 文件放在 css 目录
            if (/css/i.test(ext)) {
              return `css/[name]-[hash][extname]`;
            }
            // 图片文件放在 images 目录
            if (/png|jpe?g|svg|gif|tiff|bmp|ico|webp/i.test(ext)) {
              return `images/[name]-[hash][extname]`;
            }
            // 字体文件放在 fonts 目录
            if (/woff2?|eot|ttf|otf/i.test(ext)) {
              return `fonts/[name]-[hash][extname]`;
            }
            // 其他文件按扩展名分类
            return `${ext}/[name]-[hash][extname]`;
          },
        },
      },
      // 提高构建性能
      target: "es2015",
      // CSS 压缩配置
      cssMinify: "lightningcss",
    },
  };
});
