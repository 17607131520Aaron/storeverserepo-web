#!/bin/bash

# Jenkins 部署脚本（不使用 Docker）
#
# 使用方法:
#   简化用法（推荐）:
#     ./scripts/jenkins-deploy.sh dev   # 自动执行构建和部署
#     ./scripts/jenkins-deploy.sh test  # 自动执行构建和部署
#     ./scripts/jenkins-deploy.sh prod  # 自动执行构建和部署
#
#   完整用法:
#     ./scripts/jenkins-deploy.sh [dev|test|prod] [build|deploy|backup|rollback]

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 获取项目ID（从package.json读取）
PROJECT_ID=$(node -p "require('./package.json').name" 2>/dev/null || echo "storeverserepo-web")
PROJECT_VERSION=$(node -p "require('./package.json').version" 2>/dev/null || echo "0.0.0")

# 默认值
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
    echo "  build   - 构建项目（默认）"
    echo "  deploy  - 部署到目标目录"
    echo "  backup  - 备份当前部署版本"
    echo "  rollback - 回滚到上一个版本"
    exit 1
fi

# 验证操作参数
if [[ ! "$ACTION" =~ ^(build|deploy|backup|rollback)$ ]]; then
    echo -e "${RED}错误: 无效的操作参数 '$ACTION'${NC}"
    echo ""
    echo -e "${YELLOW}使用方法:${NC}"
    echo "  简化用法: $0 [dev|test|prod]              # 自动执行构建和部署"
    echo "  完整用法: $0 [dev|test|prod] [操作]        # 指定操作"
    echo ""
    echo -e "${YELLOW}可用操作:${NC}"
    echo "  build   - 构建项目（默认）"
    echo "  deploy  - 部署到目标目录"
    echo "  backup  - 备份当前部署版本"
    echo "  rollback - 回滚到上一个版本"
    exit 1
fi

# 根据环境选择对应的配置
case $ENV in
    dev)
        BUILD_MODE="development"
        BUILD_CMD="pnpm build:dev"
        DEPLOY_DIR="${DEPLOY_DIR:-/usr/share/nginx/html-dev}"
        BACKUP_DIR="${BACKUP_DIR:-./deploy-backup/dev}"
        ;;
    test)
        BUILD_MODE="test"
        BUILD_CMD="pnpm build:test"
        DEPLOY_DIR="${DEPLOY_DIR:-/usr/share/nginx/html-test}"
        BACKUP_DIR="${BACKUP_DIR:-./deploy-backup/test}"
        ;;
    prod)
        BUILD_MODE="production"
        BUILD_CMD="pnpm build:prod"
        DEPLOY_DIR="${DEPLOY_DIR:-/usr/share/nginx/html}"
        BACKUP_DIR="${BACKUP_DIR:-./deploy-backup/prod}"
        ;;
esac

# 生成时间戳（格式：YYYYMMDDHHMMSS）
TIMESTAMP=$(date +"%Y%m%d%H%M%S")
# 备份文件名称
BACKUP_FILE="${BACKUP_DIR}/${PROJECT_ID}-${ENV}-${TIMESTAMP}.tar.gz"

# 确保备份目录存在
mkdir -p "$BACKUP_DIR"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}项目ID: ${PROJECT_ID}${NC}"
echo -e "${GREEN}项目版本: ${PROJECT_VERSION}${NC}"
echo -e "${GREEN}环境: ${ENV}${NC}"
echo -e "${GREEN}操作: ${ACTION}${NC}"
echo -e "${GREEN}构建模式: ${BUILD_MODE}${NC}"
echo -e "${GREEN}构建命令: ${BUILD_CMD}${NC}"
echo -e "${GREEN}部署目录: ${DEPLOY_DIR}${NC}"
echo -e "${GREEN}备份目录: ${BACKUP_DIR}${NC}"
echo -e "${GREEN}========================================${NC}"

# 检查 Jenkins 服务
check_jenkins_service() {
    echo -e "${BLUE}检查 Jenkins 服务状态...${NC}"

    JENKINS_FOUND=false
    JENKINS_STATUS="未运行"

    # 方法1: 检查 systemd 服务状态
    if command -v systemctl &> /dev/null; then
        if systemctl list-units --type=service --all 2>/dev/null | grep -q "jenkins.service"; then
            if systemctl is-active --quiet jenkins 2>/dev/null; then
                JENKINS_FOUND=true
                JENKINS_STATUS="运行中 (systemd)"
                JENKINS_VERSION=$(systemctl show jenkins --property=ActiveState --value 2>/dev/null || echo "")
            fi
        fi
    fi

    # 方法2: 检查 Jenkins 进程
    if [ "$JENKINS_FOUND" = false ]; then
        if pgrep -f "jenkins" > /dev/null 2>&1 || ps aux | grep -v grep | grep -q "[j]enkins"; then
            JENKINS_FOUND=true
            JENKINS_STATUS="运行中 (进程)"
        fi
    fi

    # 方法3: 检查 Jenkins 端口（默认 8080）
    if [ "$JENKINS_FOUND" = false ]; then
        if command -v netstat &> /dev/null; then
            if netstat -tuln 2>/dev/null | grep -q ":8080 "; then
                JENKINS_FOUND=true
                JENKINS_STATUS="运行中 (端口 8080)"
            fi
        elif command -v ss &> /dev/null; then
            if ss -tuln 2>/dev/null | grep -q ":8080 "; then
                JENKINS_FOUND=true
                JENKINS_STATUS="运行中 (端口 8080)"
            fi
        fi
    fi

    # 方法4: 检查 Jenkins HTTP 接口
    if [ "$JENKINS_FOUND" = false ]; then
        if command -v curl &> /dev/null; then
            if curl -s -o /dev/null -w "%{http_code}" --connect-timeout 2 "http://localhost:8080" 2>/dev/null | grep -q "200\|403\|401"; then
                JENKINS_FOUND=true
                JENKINS_STATUS="运行中 (HTTP 接口)"
            fi
        elif command -v wget &> /dev/null; then
            if wget -q --spider --timeout=2 "http://localhost:8080" 2>/dev/null; then
                JENKINS_FOUND=true
                JENKINS_STATUS="运行中 (HTTP 接口)"
            fi
        fi
    fi

    # 方法5: 检查 JENKINS_HOME 环境变量
    if [ "$JENKINS_FOUND" = false ] && [ -n "${JENKINS_HOME}" ]; then
        if [ -d "${JENKINS_HOME}" ]; then
            JENKINS_FOUND=true
            JENKINS_STATUS="已配置 (JENKINS_HOME=${JENKINS_HOME})"
        fi
    fi

    # 输出检查结果
    if [ "$JENKINS_FOUND" = true ]; then
        echo -e "${GREEN}✓ Jenkins 服务: ${JENKINS_STATUS}${NC}"

        # 如果设置了跳过检查的环境变量，则允许继续
        if [ "${SKIP_JENKINS_CHECK:-false}" = "true" ]; then
            echo -e "${YELLOW}⚠ 已检测到 Jenkins 服务，但 SKIP_JENKINS_CHECK=true，继续执行${NC}"
        fi
    else
        echo -e "${YELLOW}⚠ Jenkins 服务: ${JENKINS_STATUS}${NC}"

        # 如果设置了必须检查的环境变量，则退出
        if [ "${REQUIRE_JENKINS:-false}" = "true" ]; then
            echo -e "${RED}错误: 未检测到 Jenkins 服务，且 REQUIRE_JENKINS=true${NC}"
            echo -e "${YELLOW}提示: 如果不需要检查 Jenkins，请设置 REQUIRE_JENKINS=false${NC}"
            exit 1
        else
            echo -e "${BLUE}提示: 未检测到 Jenkins 服务，但将继续执行（设置 REQUIRE_JENKINS=true 可强制要求）${NC}"
        fi
    fi
}

# 检查必要工具
check_requirements() {
    echo -e "${BLUE}检查必要工具...${NC}"

    if ! command -v node &> /dev/null; then
        echo -e "${RED}错误: 未找到 node，请先安装 Node.js${NC}"
        exit 1
    fi

    if ! command -v pnpm &> /dev/null; then
        echo -e "${RED}错误: 未找到 pnpm，请先安装 pnpm${NC}"
        echo -e "${YELLOW}安装命令: npm install -g pnpm${NC}"
        exit 1
    fi

    echo -e "${GREEN}✓ Node.js 版本: $(node -v)${NC}"
    echo -e "${GREEN}✓ pnpm 版本: $(pnpm -v)${NC}"
}

# 安装依赖
install_dependencies() {
    echo -e "${YELLOW}安装项目依赖...${NC}"
    pnpm install --frozen-lockfile
    echo -e "${GREEN}依赖安装完成！${NC}"
}

# 构建项目
build_project() {
    # 在构建之前检查 Jenkins 服务
    check_jenkins_service

    echo -e "${YELLOW}开始构建项目（${BUILD_MODE} 模式）...${NC}"

    # 清理旧的构建产物
    if [ -d "dist" ]; then
        echo -e "${YELLOW}清理旧的构建产物...${NC}"
        rm -rf dist
    fi

    # 执行构建
    $BUILD_CMD

    if [ ! -d "dist" ] || [ -z "$(ls -A dist)" ]; then
        echo -e "${RED}错误: 构建失败，dist 目录为空或不存在${NC}"
        exit 1
    fi

    echo -e "${GREEN}构建完成！${NC}"
    echo -e "${BLUE}构建产物大小: $(du -sh dist | cut -f1)${NC}"
}

# 备份当前部署版本
backup_current_deployment() {
    if [ ! -d "$DEPLOY_DIR" ] || [ -z "$(ls -A $DEPLOY_DIR 2>/dev/null)" ]; then
        echo -e "${YELLOW}部署目录不存在或为空，跳过备份${NC}"
        return 0
    fi

    echo -e "${YELLOW}备份当前部署版本...${NC}"

    # 创建备份
    tar -czf "$BACKUP_FILE" -C "$(dirname $DEPLOY_DIR)" "$(basename $DEPLOY_DIR)" 2>/dev/null || {
        echo -e "${RED}备份失败${NC}"
        return 1
    }

    # 获取文件大小
    FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo -e "${GREEN}备份完成: ${BACKUP_FILE} (大小: ${FILE_SIZE})${NC}"

    # 清理超过30天的备份文件
    find "$BACKUP_DIR" -name "${PROJECT_ID}-${ENV}-*.tar.gz" -mtime +30 -delete 2>/dev/null || true
    echo -e "${BLUE}已清理30天前的备份文件${NC}"
}

# 部署到目标目录
deploy_to_target() {
    echo -e "${YELLOW}部署到目标目录: ${DEPLOY_DIR}${NC}"

    # 检查构建产物是否存在
    if [ ! -d "dist" ] || [ -z "$(ls -A dist)" ]; then
        echo -e "${RED}错误: dist 目录不存在或为空，请先执行构建${NC}"
        exit 1
    fi

    # 备份当前部署（如果存在）
    backup_current_deployment

    # 创建部署目录（如果不存在）
    sudo mkdir -p "$DEPLOY_DIR" || mkdir -p "$DEPLOY_DIR"

    # 备份当前部署目录（如果存在且不为空）
    if [ -d "$DEPLOY_DIR" ] && [ -n "$(ls -A $DEPLOY_DIR 2>/dev/null)" ]; then
        # 创建临时备份目录
        TEMP_BACKUP="${DEPLOY_DIR}.backup.${TIMESTAMP}"
        echo -e "${YELLOW}创建临时备份: ${TEMP_BACKUP}${NC}"
        sudo mv "$DEPLOY_DIR" "$TEMP_BACKUP" 2>/dev/null || mv "$DEPLOY_DIR" "$TEMP_BACKUP" 2>/dev/null || {
            echo -e "${RED}无法创建临时备份，部署终止${NC}"
            exit 1
        }
    fi

    # 复制构建产物到部署目录
    echo -e "${YELLOW}复制构建产物到部署目录...${NC}"
    sudo cp -r dist/* "$DEPLOY_DIR/" 2>/dev/null || cp -r dist/* "$DEPLOY_DIR/" || {
        echo -e "${RED}部署失败，正在恢复备份...${NC}"
        if [ -d "$TEMP_BACKUP" ]; then
            sudo mv "$TEMP_BACKUP" "$DEPLOY_DIR" 2>/dev/null || mv "$TEMP_BACKUP" "$DEPLOY_DIR"
        fi
        exit 1
    }

    # 设置正确的文件权限
    echo -e "${YELLOW}设置文件权限...${NC}"
    sudo chown -R nginx:nginx "$DEPLOY_DIR" 2>/dev/null || sudo chown -R www-data:www-data "$DEPLOY_DIR" 2>/dev/null || true
    sudo chmod -R 755 "$DEPLOY_DIR" 2>/dev/null || chmod -R 755 "$DEPLOY_DIR" || true

    # 清理临时备份（如果部署成功）
    if [ -d "$TEMP_BACKUP" ]; then
        echo -e "${YELLOW}清理临时备份...${NC}"
        sudo rm -rf "$TEMP_BACKUP" 2>/dev/null || rm -rf "$TEMP_BACKUP" || true
    fi

    echo -e "${GREEN}部署完成！${NC}"
}

# 重启 Nginx（可选）
restart_nginx() {
    if [ "${RESTART_NGINX:-true}" = "true" ]; then
        echo -e "${YELLOW}重启 Nginx...${NC}"

        # 检查 nginx 配置
        if command -v nginx &> /dev/null; then
            if sudo nginx -t 2>/dev/null || nginx -t 2>/dev/null; then
                # 重新加载 nginx（不中断服务）
                sudo nginx -s reload 2>/dev/null || nginx -s reload 2>/dev/null || {
                    echo -e "${YELLOW}警告: Nginx 重新加载失败，可能需要手动重启${NC}"
                }
                echo -e "${GREEN}Nginx 已重新加载${NC}"
            else
                echo -e "${RED}错误: Nginx 配置检查失败${NC}"
                exit 1
            fi
        elif command -v systemctl &> /dev/null; then
            # 使用 systemctl 重启
            sudo systemctl reload nginx 2>/dev/null || {
                echo -e "${YELLOW}警告: Nginx 重新加载失败，可能需要手动重启${NC}"
            }
            echo -e "${GREEN}Nginx 已重新加载${NC}"
        else
            echo -e "${YELLOW}警告: 未找到 Nginx 命令，请手动重启 Nginx${NC}"
        fi
    else
        echo -e "${BLUE}跳过 Nginx 重启（RESTART_NGINX=false）${NC}"
    fi
}

# 回滚到上一个版本
rollback_deployment() {
    echo -e "${YELLOW}查找最新的备份文件...${NC}"

    # 查找最新的备份文件
    LATEST_BACKUP=$(ls -t "${BACKUP_DIR}/${PROJECT_ID}-${ENV}-"*.tar.gz 2>/dev/null | head -n 1)

    if [ -z "$LATEST_BACKUP" ]; then
        echo -e "${RED}错误: 未找到备份文件${NC}"
        exit 1
    fi

    echo -e "${BLUE}找到备份文件: ${LATEST_BACKUP}${NC}"

    # 确认回滚
    if [ "${AUTO_CONFIRM:-false}" != "true" ]; then
        read -p "确认回滚到该版本? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${YELLOW}回滚已取消${NC}"
            exit 0
        fi
    fi

    # 备份当前版本
    backup_current_deployment

    # 创建临时目录
    TEMP_RESTORE_DIR="${DEPLOY_DIR}.restore.${TIMESTAMP}"
    mkdir -p "$TEMP_RESTORE_DIR"

    # 解压备份文件
    echo -e "${YELLOW}解压备份文件...${NC}"
    tar -xzf "$LATEST_BACKUP" -C "$TEMP_RESTORE_DIR" || {
        echo -e "${RED}解压失败${NC}"
        rm -rf "$TEMP_RESTORE_DIR"
        exit 1
    }

    # 恢复部署目录
    echo -e "${YELLOW}恢复部署目录...${NC}"
    RESTORED_DIR="$TEMP_RESTORE_DIR/$(basename $DEPLOY_DIR)"

    if [ -d "$RESTORED_DIR" ]; then
        # 备份当前部署目录
        if [ -d "$DEPLOY_DIR" ]; then
            sudo mv "$DEPLOY_DIR" "${DEPLOY_DIR}.backup.${TIMESTAMP}" 2>/dev/null || mv "$DEPLOY_DIR" "${DEPLOY_DIR}.backup.${TIMESTAMP}"
        fi

        # 恢复备份
        sudo mv "$RESTORED_DIR" "$DEPLOY_DIR" 2>/dev/null || mv "$RESTORED_DIR" "$DEPLOY_DIR" || {
            echo -e "${RED}恢复失败${NC}"
            exit 1
        }

        # 清理临时目录
        rm -rf "$TEMP_RESTORE_DIR"

        # 设置文件权限
        sudo chown -R nginx:nginx "$DEPLOY_DIR" 2>/dev/null || sudo chown -R www-data:www-data "$DEPLOY_DIR" 2>/dev/null || true
        sudo chmod -R 755 "$DEPLOY_DIR" 2>/dev/null || chmod -R 755 "$DEPLOY_DIR" || true

        echo -e "${GREEN}回滚完成！${NC}"

        # 重启 Nginx
        restart_nginx
    else
        echo -e "${RED}错误: 备份文件格式不正确${NC}"
        rm -rf "$TEMP_RESTORE_DIR"
        exit 1
    fi
}

# 执行操作
case $ACTION in
    build)
        check_requirements
        install_dependencies
        build_project
        echo -e "${GREEN}========================================${NC}"
        echo -e "${GREEN}构建完成！${NC}"
        echo -e "${GREEN}构建产物位于: dist/ 目录${NC}"
        echo -e "${GREEN}========================================${NC}"
        ;;
    deploy)
        check_requirements
        deploy_to_target
        restart_nginx
        echo -e "${GREEN}========================================${NC}"
        echo -e "${GREEN}部署完成！${NC}"
        echo -e "${GREEN}部署目录: ${DEPLOY_DIR}${NC}"
        echo -e "${GREEN}========================================${NC}"
        ;;
    backup)
        backup_current_deployment
        echo -e "${GREEN}========================================${NC}"
        echo -e "${GREEN}备份完成！${NC}"
        echo -e "${GREEN}备份文件: ${BACKUP_FILE}${NC}"
        echo -e "${GREEN}========================================${NC}"
        ;;
    rollback)
        rollback_deployment
        ;;
    *)
        # 默认行为：构建 + 部署
        check_requirements
        install_dependencies
        build_project
        deploy_to_target
        restart_nginx
        echo -e "${GREEN}========================================${NC}"
        echo -e "${GREEN}构建和部署完成！${NC}"
        echo -e "${GREEN}部署目录: ${DEPLOY_DIR}${NC}"
        echo -e "${GREEN}========================================${NC}"
        ;;
esac
