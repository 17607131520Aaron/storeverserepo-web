#!/bin/bash

# 本地 PM2 部署脚本
# 用于在 macOS 上快速部署项目到本地 PM2

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ECOSYSTEM_CONFIG="${PROJECT_DIR}/ecosystem.config.cjs"
DIST_DIR="${PROJECT_DIR}/dist"
LOGS_DIR="${PROJECT_DIR}/logs"
APP_NAME="storeverserepo-web"

# 打印带颜色的消息
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查命令是否存在
check_command() {
    if ! command -v "$1" &> /dev/null; then
        print_error "$1 未安装，请先安装 $1"
        exit 1
    fi
}

# 检查 PM2
check_pm2() {
    if ! command -v pm2 &> /dev/null; then
        print_error "PM2 未安装，请先安装 PM2"
        print_info "安装方法: npm install -g pm2 或 pnpm add -g pm2"
        exit 1
    fi

    print_info "PM2 版本: $(pm2 --version)"
}

# 检查 serve
check_serve() {
    # 检查 serve 是否全局安装
    if command -v serve &> /dev/null; then
        print_info "serve 已全局安装: $(serve --version 2>&1 | head -1)"
        return 0
    fi

    # 检查是否在 node_modules 中
    if [ -f "${PROJECT_DIR}/node_modules/.bin/serve" ]; then
        print_info "serve 已在项目依赖中"
        return 0
    fi

    # 尝试使用 npx
    if command -v npx &> /dev/null; then
        print_info "将使用 npx serve（如果未安装会自动下载）"
        return 0
    fi

    print_warn "serve 未安装，建议安装: npm install -g serve 或 pnpm add -g serve"
    print_warn "或者添加到项目依赖: pnpm add -D serve"
    return 1
}

# 检查构建产物
check_build() {
    if [ ! -d "$DIST_DIR" ]; then
        print_warn "dist 目录不存在，开始构建项目..."
        cd "$PROJECT_DIR"

        if [ ! -f "package.json" ]; then
            print_error "未找到 package.json，请确认项目路径正确"
            exit 1
        fi

        # 检查是否有 pnpm
        if command -v pnpm &> /dev/null; then
            print_info "使用 pnpm 构建（test 模式，适合本地部署）..."
            pnpm build:test
        elif command -v npm &> /dev/null; then
            print_info "使用 npm 构建（test 模式，适合本地部署）..."
            npm run build:test
        elif command -v yarn &> /dev/null; then
            print_info "使用 yarn 构建（test 模式，适合本地部署）..."
            yarn build:test
        else
            print_error "未找到包管理器（pnpm/npm/yarn），请先安装"
            exit 1
        fi
    fi

    if [ ! -f "${DIST_DIR}/index.html" ]; then
        print_error "dist/index.html 不存在，构建可能失败"
        exit 1
    fi

    print_info "构建产物检查通过"
}

# 强制构建（无论 dist 是否存在）
build_project() {
    print_info "开始构建项目（test 模式，适合本地部署）..."
    cd "$PROJECT_DIR"

    if [ ! -f "package.json" ]; then
        print_error "未找到 package.json，请确认项目路径正确"
        exit 1
    fi

    if command -v pnpm &> /dev/null; then
        pnpm build:test
    elif command -v npm &> /dev/null; then
        npm run build:test
    elif command -v yarn &> /dev/null; then
        yarn build:test
    else
        print_error "未找到包管理器（pnpm/npm/yarn），请先安装"
        exit 1
    fi

    if [ ! -f "${DIST_DIR}/index.html" ]; then
        print_error "构建后未找到 dist/index.html，构建失败"
        exit 1
    fi

    print_info "构建完成"
}

# 创建日志目录
create_logs_dir() {
    if [ ! -d "$LOGS_DIR" ]; then
        print_info "创建日志目录: $LOGS_DIR"
        mkdir -p "$LOGS_DIR"
    fi
}

# 更新 ecosystem.config.cjs 中的 serve 路径
update_ecosystem_config() {
    # 如果 serve 在 node_modules 中，使用完整路径
    if [ -f "${PROJECT_DIR}/node_modules/.bin/serve" ]; then
        local SERVE_PATH="${PROJECT_DIR}/node_modules/.bin/serve"
        # 检查配置是否需要更新
        if ! grep -q "$SERVE_PATH" "$ECOSYSTEM_CONFIG" 2>/dev/null; then
            print_info "更新 ecosystem.config.cjs 使用本地 serve..."
            # 这里可以添加自动更新逻辑，但为了安全，暂时不自动修改
            print_warn "建议在 ecosystem.config.cjs 中使用: script: \"${SERVE_PATH}\""
        fi
    fi
}

# 启动 PM2
start_pm2() {
    print_info "启动 PM2 应用..."

    # 检查应用是否已在运行
    if pm2 list | grep -q "$APP_NAME.*online"; then
        print_warn "应用 $APP_NAME 已在运行"
        read -p "是否重启应用? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            pm2 restart "$APP_NAME"
            print_info "应用已重启"
        else
            print_info "保持当前应用运行"
            return
        fi
    else
        # 如果应用存在但未运行，删除后重新启动
        if pm2 list | grep -q "$APP_NAME"; then
            print_warn "发现已停止的应用，删除后重新启动..."
            pm2 delete "$APP_NAME" 2>/dev/null || true
        fi

        # 启动应用
        cd "$PROJECT_DIR"
        pm2 start "$ECOSYSTEM_CONFIG"
        print_info "应用已启动"
    fi

    # 等待一下确保启动成功
    sleep 2

    # 检查状态
    if pm2 list | grep -q "$APP_NAME.*online"; then
        print_info "应用启动成功"
    else
        print_error "应用启动失败，请查看日志: pm2 logs $APP_NAME"
        exit 1
    fi
}

# 停止 PM2
stop_pm2() {
    print_info "停止 PM2 应用..."
    pm2 stop "$APP_NAME" 2>/dev/null || true
    sleep 1

    if pm2 list | grep -q "$APP_NAME.*stopped"; then
        print_info "应用已停止"
    else
        print_warn "应用可能未运行或已删除"
    fi
}

# 删除 PM2 应用
delete_pm2() {
    print_info "删除 PM2 应用..."
    pm2 delete "$APP_NAME" 2>/dev/null || true
    print_info "应用已删除"
}

# 显示状态
show_status() {
    echo
    print_info "=== 部署状态 ==="

    if pm2 list | grep -q "$APP_NAME.*online"; then
        print_info "✓ PM2 应用正在运行"

        # 获取端口信息
        local PORT=$(grep "args" "$ECOSYSTEM_CONFIG" | grep -oE "-l [0-9]+" | awk '{print $2}' || echo "8000")
        if [ -z "$PORT" ]; then
            PORT="8000"
        fi
        print_info "✓ 监听端口: $PORT"
        print_info "✓ 访问地址: http://localhost:$PORT"

        # 显示 PM2 状态
        echo
        pm2 list | grep -E "NAME|$APP_NAME" || true
    else
        print_warn "✗ PM2 应用未运行"
    fi

    if [ -d "$DIST_DIR" ] && [ -f "${DIST_DIR}/index.html" ]; then
        print_info "✓ 构建产物存在"
    else
        print_warn "✗ 构建产物不存在"
    fi

    if [ -d "$LOGS_DIR" ]; then
        print_info "✓ 日志目录存在: $LOGS_DIR"
    else
        print_warn "✗ 日志目录不存在"
    fi

    echo
}

# 显示帮助信息
show_help() {
    cat << EOF
本地 PM2 部署脚本

用法:
    $0 [命令]

命令:
    start       启动 PM2 应用（默认）
    stop        停止 PM2 应用
    restart     重启 PM2 应用
    delete      删除 PM2 应用
    status      显示部署状态
    logs        查看应用日志
    monit       打开 PM2 监控面板
    deploy      测试 -> 强制构建 -> 启动
    build       构建项目
    help        显示帮助信息

示例:
    $0              # 启动应用
    $0 start        # 启动应用
    $0 stop         # 停止应用
    $0 restart      # 重启应用
    $0 status       # 查看状态
    $0 logs         # 查看日志

EOF
}

# 主函数
main() {
    local command="${1:-start}"

    case "$command" in
        start)
            check_pm2
            check_serve
            check_build
            create_logs_dir
            update_ecosystem_config
            start_pm2
            show_status
            ;;
        stop)
            check_pm2
            stop_pm2
            ;;
        restart)
            check_pm2
            check_serve
            check_build
            create_logs_dir
            update_ecosystem_config
            pm2 restart "$APP_NAME" || start_pm2
            show_status
            ;;
        delete)
            check_pm2
            delete_pm2
            ;;
        status)
            check_pm2
            show_status
            ;;
        logs)
            check_pm2
            pm2 logs "$APP_NAME"
            ;;
        monit)
            check_pm2
            pm2 monit
            ;;
        deploy)
            check_pm2
            check_serve
            build_project
            create_logs_dir
            update_ecosystem_config
            pm2 restart "$APP_NAME" || start_pm2
            show_status
            ;;
        build)
            check_build
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "未知命令: $command"
            show_help
            exit 1
            ;;
    esac
}

# 运行主函数
main "$@"

