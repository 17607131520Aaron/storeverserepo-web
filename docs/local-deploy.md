# 本地 Nginx 部署指引

面向 macOS，本地使用 `nginx.local.conf` + `local-nginx-deploy.sh` 部署静态产物。

## 前置检查

- 已安装 Nginx（`nginx -v`）
- Node 18+，包管理器（推荐 pnpm）
- 项目路径：`/Users/alone/Desktop/project/storeverserepo-web`

## 推荐一键部署（deploy 命令）

```bash
cd /Users/alone/Desktop/project/storeverserepo-web
sudo ./scripts/local-nginx-deploy.sh deploy
```

流程：校验 Nginx → `pnpm build:test` 强制构建 → 创建日志目录 → 启动 Nginx → 输出状态。

## 手动部署步骤

```bash
cd /Users/alone/Desktop/project/storeverserepo-web

# 1) 确认符号链接（已默认使用，指向 dist）
ln -sf /Users/alone/Desktop/project/storeverserepo-web/dist /tmp/storeverserepo-web-dist

# 2) 构建（本地请用 test 或 dev）
pnpm build:test   # 或 pnpm build:dev

# 3) 日志目录
mkdir -p logs

# 4) 测试配置
sudo nginx -t -c /Users/alone/Desktop/project/storeverserepo-web/nginx.local.conf

# 5) 启动
sudo nginx -c /Users/alone/Desktop/project/storeverserepo-web/nginx.local.conf
```

## 关键配置说明

- 配置文件：`nginx.local.conf`
- 监听端口：`8000`
- root：`/tmp/storeverserepo-web-dist`（符号链接，指向 dist，避免 Desktop 权限问题）
- Nginx 运行用户：`user alone staff;`

## 常用脚本

- 部署/重启：`./scripts/local-nginx-deploy.sh start`
- 强制重建并部署：`./scripts/local-nginx-deploy.sh deploy`
- 停止：`./scripts/local-nginx-deploy.sh stop`
- 状态：`./scripts/local-nginx-deploy.sh status`
- 测试配置：`./scripts/local-nginx-deploy.sh test`

## 验证

```bash
curl -I http://localhost:8000
```

浏览器访问：`http://localhost:8000`

## 故障排查

- 403：检查 `/tmp/storeverserepo-web-dist` 是否存在且可读，查看 `logs/nginx_error.log`
- 端口占用：`lsof -i :8000`
- 配置语法：`sudo nginx -t -c nginx.local.conf`
