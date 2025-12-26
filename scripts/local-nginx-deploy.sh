#!/bin/bash

# 本地 Nginx 部署脚本
# 用于在 macOS 上快速部署项目到本地 Nginx

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NGINX_CONF="${PROJECT_DIR}/nginx.local.conf"
DIST_DIR="${PROJECT_DIR}/dist"
LOGS_DIR="${PROJECT_DIR}/logs"

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

# 检查 Nginx
check_nginx() {
    if ! command -v nginx &> /dev/null; then
        print_error "Nginx 未安装，请先安装 Nginx"
        print_info "安装方法: brew install nginx"
        exit 1
    fi

    print_info "Nginx 版本: $(nginx -v 2>&1)"
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

# 测试 Nginx 配置
test_nginx_config() {
    print_info "测试 Nginx 配置文件..."

    if sudo nginx -t -c "$NGINX_CONF" 2>&1 | grep -q "successful"; then
        print_info "配置文件语法正确"
        return 0
    else
        print_error "配置文件语法错误"
        sudo nginx -t -c "$NGINX_CONF"
        return 1
    fi
}

# 启动 Nginx
start_nginx() {
    print_info "启动 Nginx..."

    # 检查是否已有 Nginx 进程
    if pgrep -x nginx > /dev/null; then
        print_warn "Nginx 已在运行"

        # 检查是否使用了项目配置
        if sudo nginx -t -c "$NGINX_CONF" 2>&1 | grep -q "successful"; then
            print_info "重载 Nginx 配置..."
            sudo nginx -s reload -c "$NGINX_CONF" 2>/dev/null || {
                print_warn "无法重载配置，尝试停止后重启..."
                stop_nginx
                sudo nginx -c "$NGINX_CONF"
            }
        else
            print_warn "当前运行的 Nginx 可能不是使用项目配置"
            read -p "是否停止当前 Nginx 并使用项目配置重启? (y/n) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                stop_nginx
                sudo nginx -c "$NGINX_CONF"
            else
                print_info "保持当前 Nginx 运行"
                return
            fi
        fi
    else
        sudo nginx -c "$NGINX_CONF"
    fi

    sleep 1

    if pgrep -x nginx > /dev/null; then
        print_info "Nginx 启动成功"
    else
        print_error "Nginx 启动失败"
        exit 1
    fi
}

# 停止 Nginx
stop_nginx() {
    print_info "停止 Nginx..."
    sudo nginx -s stop 2>/dev/null || true
    sleep 1

    if ! pgrep -x nginx > /dev/null; then
        print_info "Nginx 已停止"
    else
        print_warn "Nginx 可能仍在运行"
    fi
}

# 显示状态
show_status() {
    echo
    print_info "=== 部署状态 ==="

    if pgrep -x nginx > /dev/null; then
        print_info "✓ Nginx 正在运行"

        # 获取监听端口
        PORT=$(grep "listen" "$NGINX_CONF" | grep -v "#" | head -1 | awk '{print $2}' | sed 's/;//')
        if [ -n "$PORT" ]; then
            print_info "✓ 监听端口: $PORT"
            print_info "✓ 访问地址: http://localhost:$PORT"
        fi
    else
        print_warn "✗ Nginx 未运行"
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
本地 Nginx 部署脚本

用法:
    $0 [命令]

命令:
    start       启动 Nginx（默认）
    stop        停止 Nginx
    restart     重启 Nginx
    reload      重载 Nginx 配置
    status      显示部署状态
    test        测试配置文件
    deploy      测试配置 -> 强制构建 -> 启动
    build       构建项目
    help        显示帮助信息

示例:
    $0              # 启动 Nginx
    $0 start        # 启动 Nginx
    $0 stop         # 停止 Nginx
    $0 restart      # 重启 Nginx
    $0 status       # 查看状态

EOF
}

# 主函数
main() {
    local command="${1:-start}"

    case "$command" in
        start)
            check_nginx
            check_build
            create_logs_dir
            test_nginx_config || exit 1
            start_nginx
            show_status
            ;;
        stop)
            stop_nginx
            ;;
        restart)
            stop_nginx
            sleep 1
            check_nginx
            check_build
            create_logs_dir
            test_nginx_config || exit 1
            start_nginx
            show_status
            ;;
        reload)
            test_nginx_config || exit 1
            if pgrep -x nginx > /dev/null; then
                sudo nginx -s reload -c "$NGINX_CONF" 2>/dev/null || {
                    print_warn "重载失败，尝试重启..."
                    stop_nginx
                    sudo nginx -c "$NGINX_CONF"
                }
                print_info "配置已重载"
            else
                print_warn "Nginx 未运行，启动 Nginx..."
                start_nginx
            fi
            ;;
        status)
            show_status
            ;;
        test)
            test_nginx_config
            ;;
        deploy)
            check_nginx
            test_nginx_config || exit 1
            build_project
            create_logs_dir
            start_nginx
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

