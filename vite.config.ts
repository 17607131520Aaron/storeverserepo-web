import { resolve } from "path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8000,
    open: true,
    host: "0.0.0.0",
    strictPort: false,
    cors: true,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
    // 优化模块解析
    extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json"],
  },
});
