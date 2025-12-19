# Docker 多环境部署指南

本项目支持通过 Docker 进行多环境部署（开发环境、测试环境、生产环境）。

## 文件说明

- `Dockerfile` - Docker 镜像构建文件，支持通过 `BUILD_MODE` 参数指定构建环境
- `docker-compose.yml` - 统一的多环境配置文件（使用 profiles 区分环境）
- `docker-deploy.sh` - 便捷部署脚本

## 快速开始

### 方式一：使用部署脚本（推荐）

部署脚本支持以下特性：

- **自动镜像命名**：格式为 `项目id-环境-时间戳`（如：`storeverserepo-web-prod-20231220123456`）
- **自动备份**：构建新镜像前自动备份旧镜像到 `./docker-backup/` 目录
- **自动启动**：构建完成后自动停止旧容器并启动新容器
- **简化使用**：只需指定环境，自动执行完整的构建和部署流程

#### 简化用法（推荐）

```bash
# 只需指定环境，自动执行构建、备份、部署
./scripts/docker-deploy.sh dev   # 开发环境
./scripts/docker-deploy.sh test  # 测试环境
./scripts/docker-deploy.sh prod  # 生产环境
```

#### 完整用法

```bash
# 开发环境
./scripts/docker-deploy.sh dev build    # 构建并自动部署（等同于 ./scripts/docker-deploy.sh dev）
./scripts/docker-deploy.sh dev up       # 仅启动（如果镜像已存在）
./scripts/docker-deploy.sh dev down     # 停止开发环境
./scripts/docker-deploy.sh dev logs     # 查看日志
./scripts/docker-deploy.sh dev restart  # 重启
./scripts/docker-deploy.sh dev backup   # 手动备份当前镜像

# 测试环境
./scripts/docker-deploy.sh test build   # 构建并自动部署（等同于 ./scripts/docker-deploy.sh test）
./scripts/docker-deploy.sh test up      # 仅启动

# 生产环境
./scripts/docker-deploy.sh prod build   # 构建并自动部署（等同于 ./scripts/docker-deploy.sh prod）
./scripts/docker-deploy.sh prod up      # 仅启动
```

### 方式二：使用 docker-compose 命令

```bash
# 开发环境（端口 8080）
docker-compose --profile dev up -d
docker-compose --profile dev build
docker-compose --profile dev down

# 测试环境（端口 8081）
docker-compose --profile test up -d
docker-compose --profile test build
docker-compose --profile test down

# 生产环境（端口 80）
docker-compose --profile prod up -d
docker-compose --profile prod build
docker-compose --profile prod down

# 或者直接使用（默认生产环境）
docker-compose up -d
```

### 方式三：使用 Docker 命令

```bash
# 构建镜像
docker build --build-arg BUILD_MODE=dev -t storeverserepo-web:dev .
docker build --build-arg BUILD_MODE=test -t storeverserepo-web:test .
docker build --build-arg BUILD_MODE=prod -t storeverserepo-web:prod .

# 运行容器
docker run -d -p 8080:80 --name storeverserepo-web-dev storeverserepo-web:dev
docker run -d -p 8081:80 --name storeverserepo-web-test storeverserepo-web:test
docker run -d -p 80:80 --name storeverserepo-web-prod storeverserepo-web:prod
```

## 环境配置

### 端口映射

- **开发环境**: `8080:80`
- **测试环境**: `8081:80`
- **生产环境**: `80:80`

### 镜像命名规则

镜像名称格式：`项目id-环境-时间戳`

示例：

- `storeverserepo-web-dev-20231220123456`
- `storeverserepo-web-test-20231220123456`
- `storeverserepo-web-prod-20231220123456`

每个镜像还会被打上以下标签：

- `${项目id}:${环境}` - 当前环境标签（如：`storeverserepo-web:prod`）
- `${项目id}:${环境}-latest` - 最新标签（如：`storeverserepo-web:prod-latest`）

### 镜像备份

- **备份位置**: `./docker-backup/` 目录
- **备份格式**: `项目id-环境-时间戳.tar.gz`
- **自动清理**: 自动删除30天前的备份文件
- **手动备份**: 使用 `./scripts/docker-deploy.sh <env> backup` 命令

### 环境变量文件

构建时会自动读取对应的环境变量文件：

- 开发环境: `.env.development`
- 测试环境: `.env.test`（如果存在）
- 生产环境: `.env.production`

## 部署脚本使用说明

`docker-deploy.sh` 脚本支持以下操作：

| 操作      | 说明                                                       |
| --------- | ---------------------------------------------------------- |
| `build`   | 构建镜像（不缓存）、自动备份旧镜像、自动启动新容器（推荐） |
| `up`      | 仅启动容器（如果镜像已存在）                               |
| `down`    | 停止并删除容器                                             |
| `restart` | 重启容器                                                   |
| `logs`    | 查看日志（实时）                                           |
| `stop`    | 停止容器                                                   |
| `start`   | 启动已停止的容器                                           |
| `backup`  | 手动备份当前运行的镜像到备份目录                           |

### 示例

```bash
# 构建并自动部署开发环境（推荐方式）
./scripts/docker-deploy.sh dev build
# 这会：
# 1. 检测并备份当前运行的镜像
# 2. 停止并删除旧容器
# 3. 构建新镜像（带时间戳）
# 4. 自动启动新容器

# 查看生产环境日志
./scripts/docker-deploy.sh prod logs

# 重启测试环境
./scripts/docker-deploy.sh test restart

# 手动备份当前镜像
./scripts/docker-deploy.sh prod backup
```

## 环境说明

### 开发环境 (dev)

- 镜像标签: `storeverserepo-web:dev`
- 容器名称: `storeverserepo-web-dev`
- 端口: `8080`
- 构建模式: `dev`
- 环境变量: `NODE_ENV=development`

### 测试环境 (test)

- 镜像标签: `storeverserepo-web:test`
- 容器名称: `storeverserepo-web-test`
- 端口: `8081`
- 构建模式: `test`
- 环境变量: `NODE_ENV=test`

### 生产环境 (prod)

- 镜像标签: `storeverserepo-web:prod`
- 容器名称: `storeverserepo-web-prod`
- 端口: `80`
- 构建模式: `prod`
- 环境变量: `NODE_ENV=production`

## 注意事项

1. **环境变量文件**: 确保对应的 `.env.*` 文件存在且配置正确
2. **端口冲突**: 确保端口未被占用，或修改 docker-compose 文件中的端口映射
3. **镜像构建**: 首次构建可能需要较长时间，后续构建会使用缓存加速
4. **数据持久化**: 当前配置未包含数据卷，如需持久化数据请添加 volumes 配置
5. **镜像备份**: 备份文件保存在 `./docker-backup/` 目录，会自动压缩以节省空间
6. **备份清理**: 脚本会自动清理30天前的备份文件，如需保留更长时间请手动管理
7. **项目ID**: 脚本会自动从 `package.json` 读取项目名称作为项目ID

## 常见问题

### Q: 如何同时运行多个环境？

A: 可以同时运行，它们使用不同的端口和容器名称，不会冲突。

### Q: 如何更新镜像？

A: 使用 `build` 操作重新构建镜像，然后使用 `restart` 重启容器。

### Q: 如何查看容器状态？

A: 使用 `docker ps` 或 `docker-compose --profile <env> ps`。

### Q: 如何进入容器？

A: 使用 `docker exec -it <container-name> sh`。
