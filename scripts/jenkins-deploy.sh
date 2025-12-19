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
# 如果只传了一个参数（环境），则执行构建+部署；如果传了两个参数，则执行指定操作
if [ -z "$2" ]; then
    # 简化用法：只传环境参数，自动执行构建和部署
    ACTION="build_and_deploy"
else
    # 完整用法：传了操作参数，执行指定操作
    ACTION=$2
fi

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
if [[ ! "$ACTION" =~ ^(build|deploy|backup|rollback|build_and_deploy)$ ]]; then
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
# 检测操作系统，在 macOS 上使用本地部署目录，避免需要 sudo 权限
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS: 使用项目本地部署目录
    case $ENV in
        dev)
            BUILD_MODE="development"
            BUILD_CMD="pnpm build:dev"
            DEPLOY_DIR="${DEPLOY_DIR:-./deploy/dev}"
            BACKUP_DIR="${BACKUP_DIR:-./deploy-backup/dev}"
            APP_URL="${APP_URL:-http://localhost:8080}"
            ;;
        test)
            BUILD_MODE="test"
            BUILD_CMD="pnpm build:test"
            DEPLOY_DIR="${DEPLOY_DIR:-./deploy/test}"
            BACKUP_DIR="${BACKUP_DIR:-./deploy-backup/test}"
            APP_URL="${APP_URL:-http://localhost:8081}"
            ;;
        prod)
            BUILD_MODE="production"
            BUILD_CMD="pnpm build:prod"
            DEPLOY_DIR="${DEPLOY_DIR:-./deploy/prod}"
            BACKUP_DIR="${BACKUP_DIR:-./deploy-backup/prod}"
            APP_URL="${APP_URL:-http://localhost}"
            ;;
    esac
else
    # Linux: 使用系统 nginx 目录
    case $ENV in
        dev)
            BUILD_MODE="development"
            BUILD_CMD="pnpm build:dev"
            DEPLOY_DIR="${DEPLOY_DIR:-/usr/share/nginx/html-dev}"
            BACKUP_DIR="${BACKUP_DIR:-./deploy-backup/dev}"
            APP_URL="${APP_URL:-http://localhost:8080}"
            ;;
        test)
            BUILD_MODE="test"
            BUILD_CMD="pnpm build:test"
            DEPLOY_DIR="${DEPLOY_DIR:-/usr/share/nginx/html-test}"
            BACKUP_DIR="${BACKUP_DIR:-./deploy-backup/test}"
            APP_URL="${APP_URL:-http://localhost:8081}"
            ;;
        prod)
            BUILD_MODE="production"
            BUILD_CMD="pnpm build:prod"
            DEPLOY_DIR="${DEPLOY_DIR:-/usr/share/nginx/html}"
            BACKUP_DIR="${BACKUP_DIR:-./deploy-backup/prod}"
            APP_URL="${APP_URL:-http://localhost}"
            ;;
    esac
fi

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
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}检查 Jenkins 服务状态...${NC}"
    echo -e "${BLUE}========================================${NC}"

    JENKINS_INSTALLED=false
    JENKINS_RUNNING=false
    JENKINS_PORT=""
    JENKINS_URL=""
    JENKINS_SERVICE_STATUS="未安装"

    # 检查1: Jenkins 是否安装 - 检查 systemd 服务文件
    if command -v systemctl &> /dev/null; then
        if systemctl list-unit-files --type=service --all 2>/dev/null | grep -q "jenkins.service"; then
            JENKINS_INSTALLED=true
            JENKINS_SERVICE_STATUS="已安装 (systemd)"

            # 检查服务状态
            if systemctl is-active --quiet jenkins 2>/dev/null; then
                JENKINS_RUNNING=true
                JENKINS_SERVICE_STATUS="运行中 (systemd)"
            elif systemctl is-enabled --quiet jenkins 2>/dev/null; then
                JENKINS_SERVICE_STATUS="已安装但未运行 (systemd)"
            fi
        fi
    fi

    # 检查2: Jenkins 是否安装 - 检查可执行文件
    if [ "$JENKINS_INSTALLED" = false ]; then
        if command -v jenkins &> /dev/null || [ -f "/usr/bin/jenkins" ] || [ -f "/usr/local/bin/jenkins" ]; then
            JENKINS_INSTALLED=true
            JENKINS_SERVICE_STATUS="已安装 (可执行文件)"
        fi
    fi

    # 检查3: Jenkins 是否安装 - 检查 JENKINS_HOME
    if [ "$JENKINS_INSTALLED" = false ] && [ -n "${JENKINS_HOME}" ]; then
        if [ -d "${JENKINS_HOME}" ]; then
            JENKINS_INSTALLED=true
            JENKINS_SERVICE_STATUS="已安装 (JENKINS_HOME=${JENKINS_HOME})"
        fi
    fi

    # 检查4: Jenkins 是否安装 - 检查常见安装目录
    if [ "$JENKINS_INSTALLED" = false ]; then
        if [ -d "/var/lib/jenkins" ] || [ -d "/usr/share/jenkins" ] || [ -d "/opt/jenkins" ]; then
            JENKINS_INSTALLED=true
            JENKINS_SERVICE_STATUS="已安装 (目录存在)"
        fi
    fi

    # 检查5: Jenkins 是否运行 - 检查进程
    if pgrep -f "jenkins" > /dev/null 2>&1 || ps aux | grep -v grep | grep -q "[j]enkins"; then
        JENKINS_RUNNING=true
        if [ "$JENKINS_INSTALLED" = false ]; then
            JENKINS_INSTALLED=true
            JENKINS_SERVICE_STATUS="运行中 (进程)"
        fi
    fi

    # 检测 Jenkins 端口
    JENKINS_PORTS=(8080 8081 8082 9080 9081)
    for port in "${JENKINS_PORTS[@]}"; do
        # 检查端口是否监听
        PORT_LISTENING=false

        # 优先使用 lsof（macOS 和 Linux 都支持）
        if command -v lsof &> /dev/null; then
            if lsof -i :${port} -P -n 2>/dev/null | grep -q "LISTEN"; then
                PORT_LISTENING=true
            fi
        # 使用 netstat（Linux）
        elif command -v netstat &> /dev/null; then
            # Linux 格式: :8080 或 0.0.0.0:8080
            # macOS 格式: 127.0.0.1.8080 或 *.8080
            if netstat -tuln 2>/dev/null | grep -qE "[:.]${port}[[:space:]]" || \
               netstat -an 2>/dev/null | grep -qE "[:.]${port}[[:space:]].*LISTEN"; then
                PORT_LISTENING=true
            fi
        # 使用 ss（Linux）
        elif command -v ss &> /dev/null; then
            if ss -tuln 2>/dev/null | grep -q ":${port} "; then
                PORT_LISTENING=true
            fi
        fi

        # 即使端口检测失败，也尝试直接访问 HTTP 接口（因为可能监听在 127.0.0.1）
        # 检查 HTTP 接口
        HTTP_RESPONSE=""
        if command -v curl &> /dev/null; then
            HTTP_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 2 "http://127.0.0.1:${port}" 2>/dev/null || echo "")
            # 如果 127.0.0.1 失败，尝试 localhost
            if [ -z "$HTTP_RESPONSE" ] || [ "$HTTP_RESPONSE" = "000" ]; then
                HTTP_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 2 "http://localhost:${port}" 2>/dev/null || echo "")
            fi
        elif command -v wget &> /dev/null; then
            if wget -q --spider --timeout=2 "http://127.0.0.1:${port}" 2>/dev/null || \
               wget -q --spider --timeout=2 "http://localhost:${port}" 2>/dev/null; then
                HTTP_RESPONSE="200"
            fi
        fi

        # 检查是否是 Jenkins（通过响应头或内容）
        if [ -n "$HTTP_RESPONSE" ] && echo "$HTTP_RESPONSE" | grep -q "200\|403\|401"; then
            # 进一步验证是否是 Jenkins
            if command -v curl &> /dev/null; then
                RESPONSE_BODY=$(curl -s --connect-timeout 2 "http://127.0.0.1:${port}" 2>/dev/null || \
                               curl -s --connect-timeout 2 "http://localhost:${port}" 2>/dev/null || echo "")
                # 检查响应头或内容中是否包含 Jenkins 标识
                if echo "$RESPONSE_BODY" | grep -qi "jenkins\|Jetty"; then
                    JENKINS_PORT=$port
                    JENKINS_URL="http://127.0.0.1:${port}"
                    JENKINS_RUNNING=true
                    break
                elif [ "$HTTP_RESPONSE" = "403" ] || [ "$HTTP_RESPONSE" = "401" ]; then
                    # 403/401 通常是 Jenkins 的认证页面
                    JENKINS_PORT=$port
                    JENKINS_URL="http://127.0.0.1:${port}"
                    JENKINS_RUNNING=true
                    break
                fi
            else
                # 如果没有 curl，但 HTTP 响应是 403/401，假设是 Jenkins
                if echo "$HTTP_RESPONSE" | grep -q "403\|401"; then
                    JENKINS_PORT=$port
                    JENKINS_URL="http://127.0.0.1:${port}"
                    JENKINS_RUNNING=true
                    break
                fi
            fi
        fi
    done

    # 输出检查结果
    echo -e "${BLUE}Jenkins 安装状态:${NC}"
    if [ "$JENKINS_INSTALLED" = true ]; then
        echo -e "${GREEN}  ✓ ${JENKINS_SERVICE_STATUS}${NC}"
    else
        echo -e "${RED}  ✗ 未安装${NC}"
    fi

    echo -e "${BLUE}Jenkins 运行状态:${NC}"
    if [ "$JENKINS_RUNNING" = true ]; then
        echo -e "${GREEN}  ✓ 运行中${NC}"
    else
        echo -e "${YELLOW}  ⚠ 未运行${NC}"
    fi

    if [ -n "$JENKINS_PORT" ]; then
        echo -e "${BLUE}Jenkins 端口:${NC}"
        echo -e "${GREEN}  ✓ ${JENKINS_PORT}${NC}"
    else
        echo -e "${BLUE}Jenkins 端口:${NC}"
        echo -e "${YELLOW}  ⚠ 未检测到${NC}"
    fi

    if [ -n "$JENKINS_URL" ]; then
        echo -e "${BLUE}Jenkins 访问地址:${NC}"
        echo -e "${GREEN}  ✓ ${JENKINS_URL}${NC}"
    else
        echo -e "${BLUE}Jenkins 访问地址:${NC}"
        echo -e "${YELLOW}  ⚠ 未检测到（默认: http://localhost:8080）${NC}"
        # 不设置默认值，保持为空，以便后续检查能正确识别
    fi

    echo -e "${BLUE}========================================${NC}"

    # 如果设置了跳过检查的环境变量
    if [ "${SKIP_JENKINS_CHECK:-false}" = "true" ]; then
        echo -e "${YELLOW}⚠ SKIP_JENKINS_CHECK=true，跳过 Jenkins 检查${NC}"
        return 0
    fi

    # 判断 Jenkins 是否可用（必须同时满足：已安装、运行中、端口和URL可访问）
    JENKINS_AVAILABLE=false
    if [ "$JENKINS_INSTALLED" = true ] && [ "$JENKINS_RUNNING" = true ] && [ -n "$JENKINS_PORT" ] && [ -n "$JENKINS_URL" ]; then
        JENKINS_AVAILABLE=true
    fi

    # 如果 Jenkins 不可用（未安装、未运行、或端口/URL未检测到），给出警告并退出构建
    if [ "$JENKINS_AVAILABLE" = false ]; then
        echo -e "${RED}========================================${NC}"
        echo -e "${RED}警告: Jenkins 服务未检测到，无法继续构建！${NC}"
        echo -e "${RED}========================================${NC}"
        echo ""

        if [ "$JENKINS_INSTALLED" = false ]; then
            echo -e "${YELLOW}Jenkins 未安装，请先安装 Jenkins：${NC}"
            echo ""
            echo -e "${BLUE}安装方法（Ubuntu/Debian）：${NC}"
            echo -e "  1. 添加 Jenkins 仓库密钥："
            echo -e "     ${GREEN}curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee /usr/share/keyrings/jenkins-keyring.asc > /dev/null${NC}"
            echo -e "  2. 添加 Jenkins 仓库："
            echo -e "     ${GREEN}echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/ | sudo tee /etc/apt/sources.list.d/jenkins.list > /dev/null${NC}"
            echo -e "  3. 更新包列表并安装："
            echo -e "     ${GREEN}sudo apt-get update${NC}"
            echo -e "     ${GREEN}sudo apt-get install jenkins${NC}"
            echo ""
            echo -e "${BLUE}安装方法（CentOS/RHEL）：${NC}"
            echo -e "  1. 添加 Jenkins 仓库："
            echo -e "     ${GREEN}sudo wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat-stable/jenkins.repo${NC}"
            echo -e "     ${GREEN}sudo rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io-2023.key${NC}"
            echo -e "  2. 安装 Jenkins："
            echo -e "     ${GREEN}sudo yum install jenkins${NC}"
            echo ""
            echo -e "${BLUE}安装方法（macOS）：${NC}"
            echo -e "  ${GREEN}brew install jenkins-lts${NC}"
            echo ""
        fi

        if [ "$JENKINS_INSTALLED" = true ] && [ "$JENKINS_RUNNING" = false ]; then
            echo -e "${YELLOW}Jenkins 已安装但未运行，请启动 Jenkins 服务：${NC}"
            echo ""

            if command -v systemctl &> /dev/null; then
                echo -e "${BLUE}使用 systemd 启动（Linux）：${NC}"
                echo -e "  ${GREEN}sudo systemctl start jenkins${NC}"
                echo -e "  ${GREEN}sudo systemctl enable jenkins  # 设置开机自启${NC}"
                echo -e "  ${GREEN}sudo systemctl status jenkins   # 查看状态${NC}"
                echo ""
            fi

            if command -v service &> /dev/null; then
                echo -e "${BLUE}使用 service 启动（Linux）：${NC}"
                echo -e "  ${GREEN}sudo service jenkins start${NC}"
                echo ""
            fi

            if [[ "$OSTYPE" == "darwin"* ]]; then
                echo -e "${BLUE}使用 brew services 启动（macOS）：${NC}"
                echo -e "  ${GREEN}brew services start jenkins-lts${NC}"
                echo ""
            fi

            if [ -f "/etc/init.d/jenkins" ]; then
                echo -e "${BLUE}使用 init.d 脚本启动：${NC}"
                echo -e "  ${GREEN}sudo /etc/init.d/jenkins start${NC}"
                echo ""
            fi

            echo -e "${BLUE}手动启动（如果使用 war 包）：${NC}"
            echo -e "  ${GREEN}java -jar jenkins.war${NC}"
            echo ""
        fi

        echo -e "${BLUE}启动后，Jenkins 默认访问地址：${NC}"
        echo -e "  ${GREEN}http://localhost:8080${NC}"
        echo ""
        # 如果端口或URL未检测到，给出额外提示
        if [ -z "$JENKINS_PORT" ] || [ -z "$JENKINS_URL" ]; then
            echo -e "${YELLOW}注意：Jenkins 端口或访问地址未检测到！${NC}"
            echo -e "  - 请确认 Jenkins 服务正在运行并监听端口"
            echo -e "  - 请检查防火墙是否阻止了端口访问"
            echo -e "  - 请确认 Jenkins 配置的端口是否正确"
            echo ""
        fi

        echo -e "${YELLOW}提示：${NC}"
        echo -e "  - 如果 Jenkins 已安装但未检测到，请确保服务正在运行"
        echo -e "  - 如果 Jenkins 运行在非默认端口，请检查防火墙设置"
        echo -e "  - 如需跳过 Jenkins 检查，可设置环境变量：${GREEN}SKIP_JENKINS_CHECK=true${NC}"
        echo ""
        echo -e "${RED}构建已终止，请先启动 Jenkins 服务后再试！${NC}"
        echo -e "${RED}========================================${NC}"
        exit 1
    fi

    # 如果设置了必须检查的环境变量，则验证服务是否运行
    if [ "${REQUIRE_JENKINS:-false}" = "true" ]; then
        if [ "$JENKINS_INSTALLED" = false ]; then
            echo -e "${RED}错误: Jenkins 未安装，且 REQUIRE_JENKINS=true${NC}"
            echo -e "${YELLOW}提示: 请先安装 Jenkins 或设置 REQUIRE_JENKINS=false${NC}"
            exit 1
        fi

        if [ "$JENKINS_RUNNING" = false ]; then
            echo -e "${RED}错误: Jenkins 未运行，且 REQUIRE_JENKINS=true${NC}"
            echo -e "${YELLOW}提示: 请启动 Jenkins 服务或设置 REQUIRE_JENKINS=false${NC}"
            exit 1
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
    # 在 macOS 上或本地目录时不需要 sudo
    if [[ "$OSTYPE" == "darwin"* ]] || [[ "$DEPLOY_DIR" == ./* ]] || [[ "$DEPLOY_DIR" == ~/* ]]; then
        mkdir -p "$DEPLOY_DIR"
    else
        sudo mkdir -p "$DEPLOY_DIR" || mkdir -p "$DEPLOY_DIR"
    fi

    # 备份当前部署目录（如果存在且不为空）
    TEMP_BACKUP=""
    if [ -d "$DEPLOY_DIR" ] && [ -n "$(ls -A $DEPLOY_DIR 2>/dev/null)" ]; then
        # 创建临时备份目录
        TEMP_BACKUP="${DEPLOY_DIR}.backup.${TIMESTAMP}"
        echo -e "${YELLOW}创建临时备份: ${TEMP_BACKUP}${NC}"
        if [[ "$OSTYPE" == "darwin"* ]] || [[ "$DEPLOY_DIR" == ./* ]] || [[ "$DEPLOY_DIR" == ~/* ]]; then
            mv "$DEPLOY_DIR" "$TEMP_BACKUP" 2>/dev/null || {
                echo -e "${RED}无法创建临时备份，部署终止${NC}"
                exit 1
            }
        else
            sudo mv "$DEPLOY_DIR" "$TEMP_BACKUP" 2>/dev/null || mv "$DEPLOY_DIR" "$TEMP_BACKUP" 2>/dev/null || {
                echo -e "${RED}无法创建临时备份，部署终止${NC}"
                exit 1
            }
        fi
    fi

    # 确保部署目录存在（可能在备份时被移动了）
    if [[ "$OSTYPE" == "darwin"* ]] || [[ "$DEPLOY_DIR" == ./* ]] || [[ "$DEPLOY_DIR" == ~/* ]]; then
        mkdir -p "$DEPLOY_DIR"
    else
        sudo mkdir -p "$DEPLOY_DIR" || mkdir -p "$DEPLOY_DIR"
    fi

    # 复制构建产物到部署目录
    echo -e "${YELLOW}复制构建产物到部署目录...${NC}"
    if [[ "$OSTYPE" == "darwin"* ]] || [[ "$DEPLOY_DIR" == ./* ]] || [[ "$DEPLOY_DIR" == ~/* ]]; then
        cp -r dist/* "$DEPLOY_DIR/" || {
            echo -e "${RED}部署失败，正在恢复备份...${NC}"
            if [ -d "$TEMP_BACKUP" ]; then
                mv "$TEMP_BACKUP" "$DEPLOY_DIR"
            fi
            exit 1
        }
    else
        sudo cp -r dist/* "$DEPLOY_DIR/" 2>/dev/null || cp -r dist/* "$DEPLOY_DIR/" || {
            echo -e "${RED}部署失败，正在恢复备份...${NC}"
            if [ -d "$TEMP_BACKUP" ]; then
                sudo mv "$TEMP_BACKUP" "$DEPLOY_DIR" 2>/dev/null || mv "$TEMP_BACKUP" "$DEPLOY_DIR"
            fi
            exit 1
        }
    fi

    # 设置正确的文件权限
    echo -e "${YELLOW}设置文件权限...${NC}"
    if [[ "$OSTYPE" == "darwin"* ]] || [[ "$DEPLOY_DIR" == ./* ]] || [[ "$DEPLOY_DIR" == ~/* ]]; then
        chmod -R 755 "$DEPLOY_DIR" || true
    else
        sudo chown -R nginx:nginx "$DEPLOY_DIR" 2>/dev/null || sudo chown -R www-data:www-data "$DEPLOY_DIR" 2>/dev/null || true
        sudo chmod -R 755 "$DEPLOY_DIR" 2>/dev/null || chmod -R 755 "$DEPLOY_DIR" || true
    fi

    # 清理临时备份（如果部署成功）
    if [ -d "$TEMP_BACKUP" ]; then
        echo -e "${YELLOW}清理临时备份...${NC}"
        sudo rm -rf "$TEMP_BACKUP" 2>/dev/null || rm -rf "$TEMP_BACKUP" || true
    fi

    echo -e "${GREEN}部署完成！${NC}"
    echo -e "${BLUE}访问地址: ${APP_URL}${NC}"
}

# 启动简单的 HTTP 服务器（用于 macOS 本地测试）
start_local_server() {
    if [[ "$OSTYPE" == "darwin"* ]] && [[ "$DEPLOY_DIR" == ./* ]] || [[ "$DEPLOY_DIR" == ~/* ]]; then
        # 检查是否已经有服务器在运行
        local PORT=$(echo "$APP_URL" | sed -E 's|.*:([0-9]+).*|\1|')
        if [ -z "$PORT" ]; then
            PORT=8080
        fi

        if lsof -i :${PORT} -P -n 2>/dev/null | grep -q LISTEN; then
            echo -e "${BLUE}端口 ${PORT} 已被占用，跳过启动本地服务器${NC}"
            return 0
        fi

        echo -e "${YELLOW}提示: 在 macOS 上，可以使用以下命令启动本地服务器访问部署文件：${NC}"
        echo -e "${GREEN}  cd ${DEPLOY_DIR} && python3 -m http.server ${PORT}${NC}"
        echo ""
        echo -e "${YELLOW}或者使用 Node.js:${NC}"
        if command -v npx &> /dev/null; then
            echo -e "${GREEN}  cd ${DEPLOY_DIR} && npx serve -p ${PORT}${NC}"
        fi
        echo ""
    fi
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
                    # 在 macOS 上，如果 nginx 不可用，提供启动本地服务器的提示
                    start_local_server
                }
                echo -e "${GREEN}Nginx 已重新加载${NC}"
            else
                echo -e "${RED}错误: Nginx 配置检查失败${NC}"
                # 在 macOS 上，如果 nginx 配置失败，提供启动本地服务器的提示
                start_local_server
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
            # 在 macOS 上，如果 nginx 不可用，提供启动本地服务器的提示
            start_local_server
        fi
    else
        echo -e "${BLUE}跳过 Nginx 重启（RESTART_NGINX=false）${NC}"
        # 即使跳过 nginx 重启，在 macOS 上也提供启动本地服务器的提示
        start_local_server
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
        echo -e "${BLUE}访问地址: ${APP_URL}${NC}"

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
        echo -e "${GREEN}访问地址: ${APP_URL}${NC}"
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
    build_and_deploy)
        # 简化用法：构建 + 部署
        check_requirements
        install_dependencies
        build_project
        deploy_to_target
        restart_nginx
        echo -e "${GREEN}========================================${NC}"
        echo -e "${GREEN}构建和部署完成！${NC}"
        echo -e "${GREEN}部署目录: ${DEPLOY_DIR}${NC}"
        echo -e "${GREEN}访问地址: ${APP_URL}${NC}"
        echo -e "${GREEN}========================================${NC}"
        ;;
    *)
        echo -e "${RED}错误: 未知的操作 '$ACTION'${NC}"
        echo ""
        echo -e "${YELLOW}可用操作:${NC}"
        echo "  build   - 构建项目"
        echo "  deploy  - 部署到目标目录"
        echo "  backup  - 备份当前部署版本"
        echo "  rollback - 回滚到上一个版本"
        exit 1
        ;;
esac
