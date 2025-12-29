// 使用 npx serve 来执行，这样 PM2 可以正确处理
// npx 会自动找到本地 node_modules 中的 serve，如果不存在会下载
const serveScript = "npx";
const serveArgs = "serve -s dist -l 8000";

module.exports = {
  apps: [
    {
      name: "storeverserepo-web",
      script: serveScript,
      args: serveArgs,
      instances: 1,
      exec_mode: "fork",
      watch: false,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
      },
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: "10s",
    },
  ],
};
