#!/bin/bash

# Podman 多环境部署脚本
# 功能：一键构建、部署、自动启动最新镜像、删除历史镜像
# 镜像命名：项目名-环境-时间戳
#
# 使用方法:
#   ./scripts/podman-deploy.sh dev    # 部署开发/测试环境
#   ./scripts/podman-deploy.sh test   # 部署测试环境
#   ./scripts/podman-deploy.sh prod   # 部署生产环境
#   ./scripts/podman-deploy.sh prod logs  # 查看日志
#   ./scripts/podman-deploy.sh prod stop  # 停止容器

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 项目配置
PROJECT_NAME=$(node -p "require('./package.json').name" 2>/dev/null || echo "storeverserepo-web")
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# 参数解析
ENV=${1:-prod}
ACTION=${2:-deploy}

# 验证环境参数
if [[ ! "$ENV" =~ ^(dev|test|prod)$ ]]; then
    echo -e "${RED}错误: 无效的环境参数 '$ENV'${NC}"
    echo ""
    echo -e "${YELLOW}使用方法:${NC}"
    echo "  $0 [dev|test|prod]           # 一键部署（默认）"
    echo "  $0 [dev|test|prod] [操作]    # 指定操作"
    echo ""
    echo -e "${YELLOW}可用操作:${NC}"
    echo "  deploy  - 构建并部署（默认）"
    echo "  build   - 仅构建镜像"
    echo "  start   - 启动容器"
    echo "  stop    - 停止容器"
    echo "  restart - 重启容器"
    echo "  logs    - 查看日志"
    echo "  status  - 查看状态"
    echo "  clean   - 清理所有历史镜像"
    exit 1
fi

# 验证操作参数
if [[ ! "$ACTION" =~ ^(deploy|build|start|stop|restart|logs|status|clean)$ ]]; then
    echo -e "${RED}错误: 无效的操作参数 '$ACTION'${NC}"
    exit 1
fi

# 环境配置
case $ENV in
    dev|test)
        BUILD_MODE="test"
        CONTAINER_PORT="8001"
        ENV_LABEL="test"
        ;;
    prod)
        BUILD_MODE="prod"
        CONTAINER_PORT="8000"
        ENV_LABEL="prod"
        ;;
esac

# 生成镜像名称
TIMESTAMP=$(date +"%Y%m%d%H%M%S")
IMAGE_NAME="${PROJECT_NAME}-${ENV_LABEL}-${TIMESTAMP}"
CONTAINER_NAME="${PROJECT_NAME}-${ENV_LABEL}"

# 保留的历史镜像数量
KEEP_IMAGES=3

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Podman 多环境部署脚本${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "${BLUE}项目名称: ${PROJECT_NAME}${NC}"
echo -e "${BLUE}环境: ${ENV_LABEL}${NC}"
echo -e "${BLUE}操作: ${ACTION}${NC}"
echo -e "${BLUE}端口: ${CONTAINER_PORT}${NC}"
echo -e "${GREEN}========================================${NC}"


# 获取最新镜像名称
get_latest_image() {
    podman images --format "{{.Repository}}:{{.Tag}}" 2>/dev/null | \
        grep "^${PROJECT_NAME}-${ENV_LABEL}-[0-9]\{14\}$" | \
        sort -r | head -1
}

# 获取所有环境相关镜像
get_all_images() {
    podman images --format "{{.Repository}}:{{.Tag}}" 2>/dev/null | \
        grep "^${PROJECT_NAME}-${ENV_LABEL}-[0-9]\{14\}$" | \
        sort -r
}

# 清理历史镜像（保留最新N个）
cleanup_old_images() {
    echo -e "${YELLOW}清理历史镜像（保留最新 ${KEEP_IMAGES} 个）...${NC}"

    local images=$(get_all_images)
    local count=0
    local deleted=0

    while IFS= read -r image; do
        if [ -n "$image" ]; then
            count=$((count + 1))
            if [ $count -gt $KEEP_IMAGES ]; then
                echo -e "${BLUE}删除旧镜像: ${image}${NC}"
                if podman rmi "$image" 2>/dev/null; then
                    deleted=$((deleted + 1))
                else
                    echo -e "${YELLOW}跳过（可能正在使用）: ${image}${NC}"
                fi
            fi
        fi
    done <<< "$images"

    if [ $deleted -gt 0 ]; then
        echo -e "${GREEN}已删除 ${deleted} 个历史镜像${NC}"
    else
        echo -e "${BLUE}无需清理${NC}"
    fi
}

# 强制清理所有历史镜像（仅保留最新1个）
force_cleanup_images() {
    echo -e "${YELLOW}强制清理所有历史镜像...${NC}"

    local images=$(get_all_images)
    local count=0
    local deleted=0

    while IFS= read -r image; do
        if [ -n "$image" ]; then
            count=$((count + 1))
            if [ $count -gt 1 ]; then
                echo -e "${BLUE}删除镜像: ${image}${NC}"
                podman rmi -f "$image" 2>/dev/null || true
                deleted=$((deleted + 1))
            fi
        fi
    done <<< "$images"

    echo -e "${GREEN}已删除 ${deleted} 个镜像${NC}"
}

# 停止并删除旧容器
stop_old_container() {
    if podman ps -a --format "{{.Names}}" | grep -q "^${CONTAINER_NAME}$"; then
        echo -e "${YELLOW}停止旧容器: ${CONTAINER_NAME}${NC}"
        podman stop "$CONTAINER_NAME" 2>/dev/null || true
        podman rm "$CONTAINER_NAME" 2>/dev/null || true
        echo -e "${GREEN}旧容器已移除${NC}"
    fi
}

# 构建镜像
build_image() {
    echo -e "${YELLOW}开始构建镜像: ${IMAGE_NAME}${NC}"
    echo -e "${BLUE}构建模式: ${BUILD_MODE}${NC}"

    cd "$PROJECT_DIR"

    # 使用 Podman 构建（使用国内镜像源的 Dockerfile）
    podman build \
        --build-arg BUILD_MODE="$BUILD_MODE" \
        -t "$IMAGE_NAME" \
        -f Dockerfile.podman \
        .

    echo -e "${GREEN}镜像构建完成: ${IMAGE_NAME}${NC}"
}

# 启动容器
start_container() {
    local image_to_use="$1"

    if [ -z "$image_to_use" ]; then
        image_to_use=$(get_latest_image)
    fi

    if [ -z "$image_to_use" ]; then
        echo -e "${RED}错误: 未找到可用镜像，请先构建${NC}"
        exit 1
    fi

    echo -e "${YELLOW}启动容器...${NC}"
    echo -e "${BLUE}使用镜像: ${image_to_use}${NC}"

    # 停止旧容器
    stop_old_container

    # 启动新容器
    podman run -d \
        --name "$CONTAINER_NAME" \
        -p "${CONTAINER_PORT}:80" \
        --restart unless-stopped \
        "$image_to_use"

    # 等待容器启动
    sleep 2

    # 检查容器状态
    if podman ps --format "{{.Names}}" | grep -q "^${CONTAINER_NAME}$"; then
        echo -e "${GREEN}========================================${NC}"
        echo -e "${GREEN}容器启动成功！${NC}"
        echo -e "${GREEN}容器名称: ${CONTAINER_NAME}${NC}"
        echo -e "${GREEN}使用镜像: ${image_to_use}${NC}"
        echo -e "${GREEN}访问地址: http://localhost:${CONTAINER_PORT}${NC}"
        echo -e "${GREEN}========================================${NC}"
    else
        echo -e "${RED}容器启动失败，查看日志:${NC}"
        podman logs "$CONTAINER_NAME" 2>/dev/null || true
        exit 1
    fi
}

# 一键部署（构建 + 启动 + 清理）
deploy() {
    echo -e "${GREEN}开始一键部署...${NC}"

    # 1. 构建新镜像
    build_image

    # 2. 启动新容器
    start_container "$IMAGE_NAME"

    # 3. 清理历史镜像
    cleanup_old_images

    echo -e "${GREEN}部署完成！${NC}"
}

# 查看容器状态
show_status() {
    echo -e "${YELLOW}容器状态:${NC}"
    podman ps -a --filter "name=${CONTAINER_NAME}" --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"

    echo ""
    echo -e "${YELLOW}相关镜像:${NC}"
    local images=$(get_all_images)
    if [ -n "$images" ]; then
        echo "$images" | head -10
        local total=$(echo "$images" | wc -l | tr -d ' ')
        echo -e "${BLUE}共 ${total} 个镜像${NC}"
    else
        echo -e "${BLUE}无相关镜像${NC}"
    fi
}

# 查看日志
show_logs() {
    if podman ps -a --format "{{.Names}}" | grep -q "^${CONTAINER_NAME}$"; then
        podman logs -f "$CONTAINER_NAME"
    else
        echo -e "${RED}容器不存在: ${CONTAINER_NAME}${NC}"
        exit 1
    fi
}

# 执行操作
case $ACTION in
    deploy)
        deploy
        ;;
    build)
        build_image
        echo -e "${GREEN}镜像构建完成: ${IMAGE_NAME}${NC}"
        ;;
    start)
        start_container
        ;;
    stop)
        echo -e "${YELLOW}停止容器: ${CONTAINER_NAME}${NC}"
        podman stop "$CONTAINER_NAME" 2>/dev/null || echo -e "${YELLOW}容器未运行${NC}"
        ;;
    restart)
        echo -e "${YELLOW}重启容器: ${CONTAINER_NAME}${NC}"
        podman restart "$CONTAINER_NAME" 2>/dev/null || start_container
        ;;
    logs)
        show_logs
        ;;
    status)
        show_status
        ;;
    clean)
        force_cleanup_images
        ;;
esac
