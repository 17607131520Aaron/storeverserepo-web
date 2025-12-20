#!/bin/bash

# Docker 多环境部署脚本（支持镜像备份和自动启动）
#
# 使用方法:
#   简化用法（推荐）:
#     ./scripts/docker-deploy.sh dev   # 自动执行构建、备份、部署（dev 等同于 test）
#     ./scripts/docker-deploy.sh test  # 自动执行构建、备份、部署
#     ./scripts/docker-deploy.sh prod  # 自动执行构建、备份、部署
#
#   完整用法:
#     ./scripts/docker-deploy.sh [dev|test|prod] [build|up|down|restart|logs|stop|start|backup]
#
#   注意: dev 和 test 环境指向同一个配置（测试环境）

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 获取项目ID（从package.json读取）
PROJECT_ID=$(node -p "require('./package.json').name" 2>/dev/null || echo "storeverserepo-web")

# 默认值
# 如果只提供一个参数，默认为环境，操作自动为 build（构建并部署）
# 如果提供两个参数，第一个是环境，第二个是操作
ENV=${1:-prod}
ACTION=${2:-build}

# 验证环境参数
if [[ ! "$ENV" =~ ^(dev|test|prod)$ ]]; then
    echo -e "${RED}错误: 无效的环境参数 '$ENV'${NC}"
    echo ""
    echo -e "${YELLOW}使用方法:${NC}"
    echo "  简化用法: $0 [dev|test|prod]              # 自动执行构建和部署"
    echo "  完整用法: $0 [dev|test|prod] [操作]        # 指定操作"
    echo ""
    echo -e "${YELLOW}可用操作:${NC}"
    echo "  build   - 构建镜像、备份旧镜像、自动部署（默认）"
    echo "  up      - 仅启动容器"
    echo "  down    - 停止并删除容器"
    echo "  restart - 重启容器"
    echo "  logs    - 查看日志"
    echo "  stop    - 停止容器"
    echo "  start   - 启动容器"
    echo "  backup  - 手动备份镜像"
    exit 1
fi

# 验证操作参数
if [[ ! "$ACTION" =~ ^(build|up|down|restart|logs|stop|start|backup)$ ]]; then
    echo -e "${RED}错误: 无效的操作参数 '$ACTION'${NC}"
    echo ""
    echo -e "${YELLOW}使用方法:${NC}"
    echo "  简化用法: $0 [dev|test|prod]              # 自动执行构建和部署"
    echo "  完整用法: $0 [dev|test|prod] [操作]        # 指定操作"
    echo ""
    echo -e "${YELLOW}可用操作:${NC}"
    echo "  build   - 构建镜像、备份旧镜像、自动部署（默认）"
    echo "  up      - 仅启动容器"
    echo "  down    - 停止并删除容器"
    echo "  restart - 重启容器"
    echo "  logs    - 查看日志"
    echo "  stop    - 停止容器"
    echo "  start   - 启动容器"
    echo "  backup  - 手动备份镜像"
    exit 1
fi

# 根据环境选择对应的配置
# 注意: dev 和 test 指向同一个测试环境配置
case $ENV in
    dev|test)
        # dev 和 test 都使用测试环境配置
        PROFILE="test"
        SERVICE="web-test"
        CONTAINER_NAME="storeverserepo-web-test"
        PORT="8001"
        BUILD_MODE="test"
        # 如果输入的是 dev，将 ENV 改为 test 以保持一致性
        if [ "$ENV" = "dev" ]; then
            ENV="test"
        fi
        ;;
    prod)
        PROFILE="prod"
        SERVICE="web-prod"
        CONTAINER_NAME="storeverserepo-web-prod"
        PORT="8000"
        BUILD_MODE="prod"
        ;;
esac

# 生成时间戳（格式：YYYYMMDDHHMMSS）
TIMESTAMP=$(date +"%Y%m%d%H%M%S")
# 生成镜像名称：项目id-环境-时间戳
IMAGE_NAME="${PROJECT_ID}-${ENV}-${TIMESTAMP}"
# 当前使用的镜像标签（用于备份）
CURRENT_IMAGE_TAG="${PROJECT_ID}:${ENV}"
# 备份目录（按环境分类）
BACKUP_DIR="./deploy-backup/${ENV}"
# 确保备份目录存在
mkdir -p "$BACKUP_DIR"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}项目ID: ${PROJECT_ID}${NC}"
echo -e "${GREEN}环境: ${ENV}${NC}"
echo -e "${GREEN}操作: ${ACTION}${NC}"
if [ "$ACTION" = "build" ]; then
    echo -e "${BLUE}提示: build 操作将自动执行备份、构建和部署${NC}"
fi
echo -e "${GREEN}Profile: ${PROFILE}${NC}"
echo -e "${GREEN}服务: ${SERVICE}${NC}"
echo -e "${GREEN}端口: ${PORT}${NC}"
echo -e "${GREEN}镜像名称: ${IMAGE_NAME}${NC}"
echo -e "${GREEN}备份目录: ${BACKUP_DIR}${NC}"
echo -e "${GREEN}========================================${NC}"

# 清理无用的时间戳镜像函数
cleanup_old_images() {
    echo -e "${YELLOW}清理无用的时间戳镜像...${NC}"

    # 获取所有时间戳镜像（格式：项目id-环境-时间戳），按时间倒序排列
    local old_images=$(docker images --format "{{.Repository}}:{{.Tag}}" | grep "^${PROJECT_ID}-${ENV}-[0-9]\{14\}$" | sort -r)

    # 如果没有时间戳镜像，直接返回
    if [ -z "$old_images" ]; then
        echo -e "${BLUE}没有需要清理的时间戳镜像${NC}"
        return
    fi

    # 保留最近5个时间戳镜像，删除其他的
    local count=0
    local deleted_count=0
    local skipped_count=0

    while IFS= read -r image; do
        if [ -n "$image" ]; then
            count=$((count + 1))
            if [ $count -gt 5 ]; then
                # 尝试删除镜像，如果失败说明可能正在使用或被其他标签引用
                echo -e "${BLUE}尝试删除旧镜像: ${image}${NC}"
                if docker rmi "$image" 2>/dev/null; then
                    deleted_count=$((deleted_count + 1))
                else
                    skipped_count=$((skipped_count + 1))
                    echo -e "${YELLOW}跳过镜像 ${image}（可能正在使用或被其他标签引用）${NC}"
                fi
            fi
        fi
    done <<< "$old_images"

    if [ $deleted_count -gt 0 ]; then
        echo -e "${GREEN}已清理 ${deleted_count} 个旧镜像${NC}"
    fi
    if [ $skipped_count -gt 0 ]; then
        echo -e "${YELLOW}跳过 ${skipped_count} 个无法删除的镜像${NC}"
    fi
    if [ $deleted_count -eq 0 ] && [ $skipped_count -eq 0 ]; then
        echo -e "${BLUE}无需清理的镜像${NC}"
    fi
}

# 备份镜像函数
backup_image() {
    local old_image=$1
    local backup_file="${BACKUP_DIR}/${PROJECT_ID}-${ENV}-${TIMESTAMP}.tar"

    # 检查镜像是否存在（支持多种格式）
    if docker images --format "{{.Repository}}:{{.Tag}}" | grep -q "^${old_image}$" || \
       docker images --format "{{.ID}}" --filter "reference=${old_image}" | grep -q "."; then
        echo -e "${YELLOW}正在备份旧镜像: ${old_image}${NC}"

        # 保存镜像
        if docker save -o "$backup_file" "$old_image" 2>/dev/null; then
            # 压缩备份文件以节省空间
            if command -v gzip &> /dev/null; then
                echo -e "${YELLOW}正在压缩备份文件...${NC}"
                gzip -f "$backup_file"
                backup_file="${backup_file}.gz"
            fi

            # 获取文件大小
            FILE_SIZE=$(du -h "$backup_file" | cut -f1)
            echo -e "${GREEN}镜像已备份到: ${backup_file} (大小: ${FILE_SIZE})${NC}"

            # 清理超过30天的备份文件
            find "$BACKUP_DIR" -name "${PROJECT_ID}-${ENV}-*.tar.gz" -mtime +30 -delete 2>/dev/null || true
            echo -e "${BLUE}已清理30天前的备份文件${NC}"

            # 统计备份文件数量
            BACKUP_COUNT=$(find "$BACKUP_DIR" -name "${PROJECT_ID}-${ENV}-*.tar.gz" 2>/dev/null | wc -l | tr -d ' ')
            echo -e "${BLUE}当前备份文件数量: ${BACKUP_COUNT}${NC}"
        else
            echo -e "${RED}备份失败: 无法保存镜像 ${old_image}${NC}"
        fi
    else
        echo -e "${YELLOW}未找到旧镜像: ${old_image}，跳过备份${NC}"
    fi
}

# 构建并部署函数
build_and_deploy() {
    echo -e "${YELLOW}开始构建 ${ENV} 环境镜像...${NC}"

    # 检查是否有正在运行的容器（通过 docker-compose）
    if docker-compose --profile $PROFILE ps --services --filter "status=running" 2>/dev/null | grep -q "^${SERVICE}$"; then
        echo -e "${YELLOW}检测到正在运行的容器: ${CONTAINER_NAME}${NC}"

        # 获取当前容器使用的镜像
        CURRENT_IMAGE=$(docker inspect --format='{{.Config.Image}}' "${CONTAINER_NAME}" 2>/dev/null || echo "")

        if [ -n "$CURRENT_IMAGE" ] && [ "$CURRENT_IMAGE" != "<no value>" ]; then
            echo -e "${BLUE}当前使用的镜像: ${CURRENT_IMAGE}${NC}"
            # 备份当前镜像
            backup_image "$CURRENT_IMAGE"
        fi

        # 停止并删除旧容器（使用 docker-compose）
        echo -e "${YELLOW}停止旧容器...${NC}"
        docker-compose --profile $PROFILE down 2>/dev/null || true
    else
        # 如果容器不是通过 docker-compose 创建的，尝试直接停止
        if docker ps --format "{{.Names}}" | grep -q "^${CONTAINER_NAME}$"; then
            echo -e "${YELLOW}检测到非 docker-compose 管理的容器: ${CONTAINER_NAME}${NC}"
            CURRENT_IMAGE=$(docker inspect --format='{{.Config.Image}}' "${CONTAINER_NAME}" 2>/dev/null || echo "")
            if [ -n "$CURRENT_IMAGE" ] && [ "$CURRENT_IMAGE" != "<no value>" ]; then
                echo -e "${BLUE}当前使用的镜像: ${CURRENT_IMAGE}${NC}"
                backup_image "$CURRENT_IMAGE"
            fi
            docker stop "${CONTAINER_NAME}" 2>/dev/null || true
            docker rm "${CONTAINER_NAME}" 2>/dev/null || true
        fi
    fi

    # 构建新镜像（使用 docker-compose build，确保与 docker-compose.yml 配置一致）
    echo -e "${YELLOW}构建新镜像: ${CURRENT_IMAGE_TAG}${NC}"

    # 设置 IMAGE_NAME 环境变量，让 docker-compose 使用指定的镜像名称
    export IMAGE_NAME="${CURRENT_IMAGE_TAG}"

    # 使用 docker-compose build 构建镜像
    docker-compose --profile $PROFILE build --build-arg BUILD_MODE=$BUILD_MODE

    # 同时打上时间戳标签（用于备份和追踪）
    if docker images --format "{{.Repository}}:{{.Tag}}" | grep -q "^${CURRENT_IMAGE_TAG}$"; then
        docker tag "${CURRENT_IMAGE_TAG}" "${IMAGE_NAME}" 2>/dev/null || true
        docker tag "${CURRENT_IMAGE_TAG}" "${PROJECT_ID}:${ENV}-latest" 2>/dev/null || true
    fi

    echo -e "${GREEN}镜像构建完成！${NC}"
    echo -e "${BLUE}镜像标签:${NC}"
    echo -e "  - ${IMAGE_NAME}"
    echo -e "  - ${CURRENT_IMAGE_TAG}"
    echo -e "  - ${PROJECT_ID}:${ENV}-latest"

    # 使用 docker-compose 启动容器（确保容器管理一致性）
    echo -e "${YELLOW}启动新容器...${NC}"
    docker-compose --profile $PROFILE up -d

    # 清理无用的旧镜像（保留最近5个时间戳镜像）
    cleanup_old_images

    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}构建并部署完成！${NC}"
    echo -e "${GREEN}镜像名称: ${CURRENT_IMAGE_TAG}${NC}"
    echo -e "${GREEN}容器名称: ${CONTAINER_NAME}${NC}"
    echo -e "${GREEN}访问地址: http://localhost:${PORT}${NC}"
    echo -e "${GREEN}========================================${NC}"
}

# 执行操作
case $ACTION in
    build)
        build_and_deploy
        ;;
    up)
        echo -e "${YELLOW}启动 ${ENV} 环境...${NC}"
        docker-compose --profile $PROFILE up -d
        echo -e "${GREEN}启动完成！${NC}"
        echo -e "${GREEN}访问地址: http://localhost:${PORT}${NC}"
        ;;
    down)
        echo -e "${YELLOW}停止 ${ENV} 环境...${NC}"
        docker-compose --profile $PROFILE down
        echo -e "${GREEN}已停止！${NC}"
        ;;
    restart)
        echo -e "${YELLOW}重启 ${ENV} 环境...${NC}"
        docker-compose --profile $PROFILE restart $SERVICE
        echo -e "${GREEN}重启完成！${NC}"
        ;;
    logs)
        echo -e "${YELLOW}查看 ${ENV} 环境日志...${NC}"
        docker-compose --profile $PROFILE logs -f $SERVICE
        ;;
    stop)
        echo -e "${YELLOW}停止 ${ENV} 环境...${NC}"
        docker-compose --profile $PROFILE stop $SERVICE
        echo -e "${GREEN}已停止！${NC}"
        ;;
    start)
        echo -e "${YELLOW}启动 ${ENV} 环境...${NC}"
        docker-compose --profile $PROFILE start $SERVICE
        echo -e "${GREEN}启动完成！${NC}"
        ;;
    backup)
        # 手动备份当前镜像
        if docker ps --format "{{.Names}}" | grep -q "^${CONTAINER_NAME}$"; then
            CURRENT_IMAGE=$(docker inspect --format='{{.Config.Image}}' "${CONTAINER_NAME}" 2>/dev/null || echo "")
            if [ -n "$CURRENT_IMAGE" ]; then
                backup_image "$CURRENT_IMAGE"
            else
                echo -e "${RED}无法获取当前镜像信息${NC}"
            fi
        else
            # 如果没有运行中的容器，尝试备份标签镜像
            if docker images --format "{{.Repository}}:{{.Tag}}" | grep -q "^${CURRENT_IMAGE_TAG}$"; then
                backup_image "$CURRENT_IMAGE_TAG"
            else
                echo -e "${RED}未找到可备份的镜像${NC}"
            fi
        fi
        ;;
esac
