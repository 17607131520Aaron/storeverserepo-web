# 🚀 立即部署指南

## 当前状态检查

✅ **已完成：**

- dist 目录存在且包含构建产物
- 符号链接已创建：`/tmp/storeverserepo-web-dist` → `dist`
- 配置文件已就绪：`nginx.local.conf`
- 端口配置：8000
- root 路径：`/tmp/storeverserepo-web-dist`

## 部署步骤

### 方式一：使用部署脚本（推荐）

```bash
cd /Users/alone/Desktop/project/storeverserepo-web

# 启动 Nginx
./scripts/local-nginx-deploy.sh start
```

脚本会自动：

1. 检查 Nginx 是否安装
2. 检查构建产物
3. 创建日志目录
4. 测试配置文件
5. 启动 Nginx

### 方式二：手动部署

```bash
cd /Users/alone/Desktop/project/storeverserepo-web

# 1. 确保符号链接存在
ln -sf /Users/alone/Desktop/project/storeverserepo-web/dist /tmp/storeverserepo-web-dist

# 2. 创建日志目录
mkdir -p logs

# 3. 停止旧的 Nginx 进程（如果有）
sudo nginx -s stop 2>/dev/null || true

# 4. 测试配置文件
sudo nginx -t -c /Users/alone/Desktop/project/storeverserepo-web/nginx.local.conf

# 5. 启动 Nginx
sudo nginx -c /Users/alone/Desktop/project/storeverserepo-web/nginx.local.conf

# 6. 检查状态
ps aux | grep nginx | grep -v grep
```

## 验证部署

部署成功后，访问：**http://localhost:8000**

### 检查 Nginx 状态

```bash
# 查看进程
ps aux | grep nginx

# 查看日志
tail -f logs/nginx_error.log
tail -f logs/nginx_access.log

# 测试连接
curl -I http://localhost:8000
```

## 常用命令

```bash
# 启动
./scripts/local-nginx-deploy.sh start

# 停止
./scripts/local-nginx-deploy.sh stop

# 重启
./scripts/local-nginx-deploy.sh restart

# 重载配置（不中断服务）
./scripts/local-nginx-deploy.sh reload

# 查看状态
./scripts/local-nginx-deploy.sh status

# 测试配置
./scripts/local-nginx-deploy.sh test
```

## 故障排查

如果遇到问题，请检查：

1. **403 Forbidden**
   - 检查符号链接：`ls -la /tmp/storeverserepo-web-dist`
   - 检查文件权限：`ls -la dist/`

2. **端口被占用**

   ```bash
   lsof -i :8000
   ```

3. **配置文件错误**

   ```bash
   sudo nginx -t -c /Users/alone/Desktop/project/storeverserepo-web/nginx.local.conf
   ```

4. **查看错误日志**
   ```bash
   tail -20 logs/nginx_error.log
   ```
