#!/bin/bash
set -e

# ============================================================================
# OpsPilot 一键部署脚本 (Linux)
# 单容器方案: Nginx + Backend 打包在一个 Docker 镜像中
# 安装时验证: 端口可用性 + 管理员账号密码
# ============================================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

IMAGE_NAME="opspilot/opspilot"
CONTAINER_NAME="opspilot"
DEFAULT_PORT=80

log_info()  { echo -e "${GREEN}[✓]${NC} $1"; }
log_warn()  { echo -e "${YELLOW}[!]${NC} $1"; }
log_error() { echo -e "${RED}[✗]${NC} $1"; }
log_step()  { echo -e "\n${CYAN}━━━ $1 ━━━${NC}"; }

# ── 检查是否 root ──────────────────────────────────────────────────────────
check_root() {
    if [ "$(id -u)" -ne 0 ]; then
        log_error "请使用 root 用户运行此脚本: sudo bash deploy.sh"
        exit 1
    fi
}

# ── 检测系统 ──────────────────────────────────────────────────────────────
detect_os() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$ID
        OS_VERSION=$VERSION_ID
    else
        log_error "无法检测操作系统"
        exit 1
    fi
    log_info "检测到系统: $OS $OS_VERSION"
}

# ── 安装 Docker ───────────────────────────────────────────────────────────
install_docker() {
    if command -v docker &> /dev/null; then
        log_info "Docker 已安装: $(docker --version)"
        # 确保 Docker 服务正在运行
        if ! docker info &> /dev/null; then
            log_warn "Docker 服务未启动，正在启动..."
            systemctl start docker
            systemctl enable docker
        fi
        return
    fi

    log_step "安装 Docker"
    case $OS in
        ubuntu|debian)
            apt-get update -qq
            apt-get install -y -qq ca-certificates curl gnupg
            install -m 0755 -d /etc/apt/keyrings
            curl -fsSL https://download.docker.com/linux/$OS/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
            chmod a+r /etc/apt/keyrings/docker.gpg
            echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/$OS $(lsb_release -cs) stable" > /etc/apt/sources.list.d/docker.list
            apt-get update -qq
            apt-get install -y -qq docker-ce docker-ce-cli containerd.io
            ;;
        centos|rhel|rocky|almalinux|fedora)
            if command -v dnf &> /dev/null; then
                dnf install -y yum-utils
                yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
                dnf install -y docker-ce docker-ce-cli containerd.io
            else
                yum install -y yum-utils
                yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
                yum install -y docker-ce docker-ce-cli containerd.io
            fi
            ;;
        arch|manjaro)
            pacman -Sy --noconfirm docker
            ;;
        *)
            log_error "不支持的发行版: $OS，请手动安装 Docker"
            exit 1
            ;;
    esac

    systemctl enable docker
    systemctl start docker
    log_info "Docker 安装完成"
}

# ── 端口检查 ──────────────────────────────────────────────────────────────
check_port() {
    local port=$1
    # 检查端口是否被占用
    local occupied_by=""
    if command -v ss &> /dev/null; then
        occupied_by=$(ss -tlnp 2>/dev/null | grep ":${port} " | head -1)
    elif command -v netstat &> /dev/null; then
        occupied_by=$(netstat -tlnp 2>/dev/null | grep ":${port} " | head -1)
    fi

    if [ -n "$occupied_by" ]; then
        # 提取占用进程名
        local proc=$(echo "$occupied_by" | grep -oP 'users:\(\("\K[^"]+' 2>/dev/null || echo "unknown")
        if [ "$proc" = "nginx" ] || echo "$occupied_by" | grep -qi "nginx"; then
            log_warn "端口 $port 被主机 Nginx 占用"
            log_warn "OpsPilot 单容器自带 Nginx，建议:"
            echo "    1. 停止主机 Nginx: systemctl stop nginx && systemctl disable nginx"
            echo "    2. 或使用其他端口"
            echo ""
            read -p "是否停止主机 Nginx 并释放端口? [y/N]: " stop_nginx
            if [ "$stop_nginx" = "y" ] || [ "$stop_nginx" = "Y" ]; then
                systemctl stop nginx 2>/dev/null || true
                systemctl disable nginx 2>/dev/null || true
                sleep 1
                if check_port "$port"; then
                    log_info "端口 $port 已释放"
                    return 0
                fi
            fi
        fi
        return 1  # 被占用
    fi
    return 0  # 可用
}

# ── 交互式配置 ────────────────────────────────────────────────────────────
configure() {
    log_step "配置 OpsPilot"

    # ── 端口配置 ──
    while true; do
        read -p "服务端口 [${DEFAULT_PORT}]: " PORT
        PORT=${PORT:-$DEFAULT_PORT}

        if ! [[ "$PORT" =~ ^[0-9]+$ ]] || [ "$PORT" -lt 1 ] || [ "$PORT" -gt 65535 ]; then
            log_error "无效端口号: $PORT (需 1-65535)"
            continue
        fi

        if ! check_port "$PORT"; then
            log_error "端口 $PORT 已被占用"
            read -p "是否使用其他端口? [Y/n]: " retry
            if [ "$retry" = "n" ] || [ "$retry" = "N" ]; then
                log_error "部署中止，请释放端口后重试"
                exit 1
            fi
            continue
        fi

        log_info "端口 $PORT 可用"
        break
    done

    # ── 管理员账号 ──
    echo ""
    echo -e "${BLUE}── 管理员账号配置 ──${NC}"
    while true; do
        read -p "管理员用户名 [admin]: " ADMIN_USER
        ADMIN_USER=${ADMIN_USER:-admin}

        if [ ${#ADMIN_USER} -lt 3 ]; then
            log_error "用户名至少 3 个字符"
            continue
        fi

        if ! [[ "$ADMIN_USER" =~ ^[a-zA-Z0-9_-]+$ ]]; then
            log_error "用户名只能包含字母、数字、下划线和连字符"
            continue
        fi

        log_info "用户名: $ADMIN_USER"
        break
    done

    while true; do
        read -s -p "管理员密码: " ADMIN_PASS
        echo ""

        if [ ${#ADMIN_PASS} -lt 6 ]; then
            log_error "密码至少 6 个字符"
            continue
        fi

        read -s -p "确认密码: " ADMIN_PASS_CONFIRM
        echo ""

        if [ "$ADMIN_PASS" != "$ADMIN_PASS_CONFIRM" ]; then
            log_error "两次密码不一致，请重新输入"
            continue
        fi

        log_info "密码已设置"
        break
    done

    # ── AI 配置 (可选) ──
    echo ""
    echo -e "${BLUE}── AI 模型配置 (可选，稍后可在 Web 界面配置) ──${NC}"
    read -p "是否现在配置 AI 模型? [y/N]: " config_ai

    AI_PROVIDER=""
    AI_BASE_URL=""
    AI_MODEL=""
    AI_API_KEY=""

    if [ "$config_ai" = "y" ] || [ "$config_ai" = "Y" ]; then
        echo "  支持: openai / anthropic / ollama"
        read -p "  Provider [openai]: " AI_PROVIDER
        AI_PROVIDER=${AI_PROVIDER:-openai}

        case $AI_PROVIDER in
            openai)
                read -p "  API Base URL [https://api.openai.com/v1]: " AI_BASE_URL
                AI_BASE_URL=${AI_BASE_URL:-https://api.openai.com/v1}
                read -p "  模型 [gpt-4o]: " AI_MODEL
                AI_MODEL=${AI_MODEL:-gpt-4o}
                read -s -p "  API Key: " AI_API_KEY
                echo ""
                ;;
            anthropic)
                read -p "  模型 [claude-sonnet-4-20250514]: " AI_MODEL
                AI_MODEL=${AI_MODEL:-claude-sonnet-4-20250514}
                read -s -p "  API Key: " AI_API_KEY
                echo ""
                ;;
            ollama)
                read -p "  Ollama 地址 [http://localhost:11434]: " AI_BASE_URL
                AI_BASE_URL=${AI_BASE_URL:-http://localhost:11434}
                read -p "  模型 [llama3]: " AI_MODEL
                AI_MODEL=${AI_MODEL:-llama3}
                ;;
        esac
    fi

    # ── 生成密钥 ──
    SECRET_KEY=$(openssl rand -hex 32 2>/dev/null || python3 -c "import secrets; print(secrets.token_hex(32))" 2>/dev/null || head -c 64 /dev/urandom | od -An -tx1 | tr -d ' \n')

    # ── 确认配置 ──
    echo ""
    log_step "配置确认"
    echo -e "  端口:      ${CYAN}${PORT}${NC}"
    echo -e "  管理员:    ${CYAN}${ADMIN_USER}${NC}"
    echo -e "  密码:      ${CYAN}******${NC}"
    if [ -n "$AI_PROVIDER" ]; then
        echo -e "  AI 模型:   ${CYAN}${AI_PROVIDER} / ${AI_MODEL}${NC}"
    else
        echo -e "  AI 模型:   ${YELLOW}稍后配置${NC}"
    fi
    echo ""
    read -p "确认以上配置? [Y/n]: " confirm
    if [ "$confirm" = "n" ] || [ "$confirm" = "N" ]; then
        log_warn "已取消，请重新运行脚本"
        exit 0
    fi
}

# ── 构建镜像 ──────────────────────────────────────────────────────────────
build_image() {
    log_step "构建 Docker 镜像"
    local SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

    if [ -f "$SCRIPT_DIR/Dockerfile.allinone" ]; then
        docker build -t "$IMAGE_NAME" -f "$SCRIPT_DIR/Dockerfile.allinone" "$SCRIPT_DIR"
    elif [ -f "/tmp/opspilot/Dockerfile.allinone" ]; then
        docker build -t "$IMAGE_NAME" -f "/tmp/opspilot/Dockerfile.allinone" "/tmp/opspilot"
    else
        log_error "找不到 Dockerfile.allinone，请在项目根目录运行此脚本"
        exit 1
    fi

    log_info "镜像构建完成: $IMAGE_NAME"
}

# ── 启动容器 ──────────────────────────────────────────────────────────────
start_container() {
    log_step "启动服务"

    # 如果已存在同名容器，先停止删除
    if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        log_warn "发现已有容器，正在停止..."
        docker stop "$CONTAINER_NAME" 2>/dev/null || true
        docker rm "$CONTAINER_NAME" 2>/dev/null || true
    fi

    # 创建数据目录
    mkdir -p /opt/opspilot/data/deployments /opt/opspilot/data/logs

    # 启动容器
    docker run -d \
        --name "$CONTAINER_NAME" \
        --restart unless-stopped \
        -p "${PORT}:80" \
        -v /opt/opspilot/data:/app/data \
        -v /var/run/docker.sock:/var/run/docker.sock \
        -e "OPSPILOT_SECRET_KEY=$SECRET_KEY" \
        -e "OPSPILOT_DATABASE_URL=sqlite+aiosqlite:///./data/opspilot.db" \
        -e "OPSPILOT_DEPLOY_BASE_PATH=/app/data/deployments" \
        -e "OPSPILOT_CORS_ORIGINS=[\"http://localhost\",\"http://localhost:${PORT}\"]" \
        "$IMAGE_NAME"

    log_info "容器已启动"
}

# ── 等待服务就绪 ──────────────────────────────────────────────────────────
wait_ready() {
    log_step "等待服务就绪"
    local max_wait=60
    local waited=0

    while [ $waited -lt $max_wait ]; do
        if docker exec "$CONTAINER_NAME" curl -sf http://localhost/health > /dev/null 2>&1; then
            log_info "后端服务就绪"
            break
        fi
        sleep 2
        waited=$((waited + 2))
        printf "\r  等待中... ${waited}s / ${max_wait}s"
    done
    echo ""

    if [ $waited -ge $max_wait ]; then
        log_error "服务启动超时，请查看日志: docker logs $CONTAINER_NAME"
        exit 1
    fi
}

# ── 创建管理员账号 ────────────────────────────────────────────────────────
create_admin() {
    log_step "创建管理员账号"

    # 通过 API 创建管理员 (或更新密码)
    # 先尝试登录验证默认账号是否存在
    local login_resp=$(curl -sf -X POST "http://localhost:${PORT}/api/v1/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"username\":\"admin\",\"password\":\"admin123\"}" 2>/dev/null || echo "")

    if echo "$login_resp" | grep -q "access_token"; then
        # 默认账号存在，通过 API 修改密码
        local token=$(echo "$login_resp" | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null || echo "")

        if [ -n "$token" ] && [ "$ADMIN_USER" != "admin" -o "$ADMIN_PASS" != "admin123" ]; then
            # 需要通过后端脚本修改用户名和密码
            docker exec "$CONTAINER_NAME" python3 -c "
import asyncio
from opspilot_core.database import get_session
from opspilot_core.models import User
from opspilot_core.core.security import hash_password
from sqlalchemy import select

async def update_admin():
    async with get_session() as db:
        result = await db.execute(select(User).where(User.username == 'admin'))
        user = result.scalar_one_or_none()
        if user:
            user.username = '$ADMIN_USER'
            user.password_hash = hash_password('$ADMIN_PASS')
            await db.commit()
            print('OK')

asyncio.run(update_admin())
" 2>/dev/null

            if [ $? -eq 0 ]; then
                log_info "管理员账号已更新: $ADMIN_USER"
            else
                log_warn "自动更新失败，请在 Web 界面修改密码"
            fi
        else
            log_info "使用默认管理员: admin / admin123"
        fi
    else
        # 默认账号不存在，直接创建
        docker exec "$CONTAINER_NAME" python3 -c "
import asyncio
from opspilot_core.database import get_session, init_db
from opspilot_core.models import User
from opspilot_core.core.security import hash_password

async def create_admin():
    await init_db()
    async with get_session() as db:
        user = User(
            username='$ADMIN_USER',
            password_hash=hash_password('$ADMIN_PASS'),
            role='admin'
        )
        db.add(user)
        await db.commit()
        print('OK')

asyncio.run(create_admin())
" 2>/dev/null

        if [ $? -eq 0 ]; then
            log_info "管理员账号已创建: $ADMIN_USER"
        else
            log_warn "自动创建失败，使用默认账号 admin / admin123"
        fi
    fi
}

# ── 配置 AI 模型 ──────────────────────────────────────────────────────────
configure_ai() {
    if [ -z "$AI_PROVIDER" ] || [ -z "$AI_MODEL" ]; then
        return
    fi

    log_step "配置 AI 模型"

    # 获取登录 token
    local login_resp=$(curl -sf -X POST "http://localhost:${PORT}/api/v1/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"username\":\"$ADMIN_USER\",\"password\":\"$ADMIN_PASS\"}" 2>/dev/null || echo "")

    local token=$(echo "$login_resp" | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null || echo "")

    if [ -z "$token" ]; then
        log_warn "无法获取 token，请在 Web 界面手动配置 AI 模型"
        return
    fi

    # 创建 AI 配置
    local api_key_json="null"
    if [ -n "$AI_API_KEY" ]; then
        api_key_json="\"$AI_API_KEY\""
    fi

    local base_url_json="null"
    if [ -n "$AI_BASE_URL" ]; then
        base_url_json="\"$AI_BASE_URL\""
    fi

    local create_resp=$(curl -sf -X POST "http://localhost:${PORT}/api/v1/ai/configs" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $token" \
        -d "{
            \"name\": \"默认 ${AI_PROVIDER}\",
            \"provider\": \"$AI_PROVIDER\",
            \"model_name\": \"$AI_MODEL\",
            \"base_url\": $base_url_json,
            \"api_key\": $api_key_json,
            \"temperature\": 0.7,
            \"max_tokens\": 4096,
            \"is_default\": true
        }" 2>/dev/null || echo "")

    if echo "$create_resp" | grep -q '"id"'; then
        log_info "AI 模型已配置: $AI_PROVIDER / $AI_MODEL"
    else
        log_warn "AI 模型配置失败，请在 Web 界面手动配置"
    fi
}

# ── 验证部署 ──────────────────────────────────────────────────────────────
verify_deployment() {
    log_step "验证部署"

    # 测试 HTTP 访问
    local http_code=$(curl -sf -o /dev/null -w "%{http_code}" "http://localhost:${PORT}/" 2>/dev/null || echo "000")
    if [ "$http_code" = "200" ]; then
        log_info "Web 前端: 正常 (HTTP $http_code)"
    else
        log_warn "Web 前端: 异常 (HTTP $http_code)"
    fi

    # 测试 API
    local api_code=$(curl -sf -o /dev/null -w "%{http_code}" "http://localhost:${PORT}/health" 2>/dev/null || echo "000")
    if [ "$api_code" = "200" ]; then
        log_info "后端 API: 正常 (HTTP $api_code)"
    else
        log_warn "后端 API: 异常 (HTTP $api_code)"
    fi

    # 测试登录
    local login_resp=$(curl -sf -X POST "http://localhost:${PORT}/api/v1/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"username\":\"$ADMIN_USER\",\"password\":\"$ADMIN_PASS\"}" 2>/dev/null || echo "")

    if echo "$login_resp" | grep -q "access_token"; then
        log_info "登录验证: 正常"
    else
        log_warn "登录验证: 失败，请检查密码"
    fi

    # 测试 Docker socket
    if docker exec "$CONTAINER_NAME" test -S /var/run/docker.sock 2>/dev/null; then
        log_info "Docker Socket: 可用"
    else
        log_warn "Docker Socket: 不可用 (容器部署功能受限)"
    fi
}

# ── 注册 systemd ──────────────────────────────────────────────────────────
install_systemd() {
    log_step "注册 systemd 服务"

    cat > /etc/systemd/system/opspilot.service << EOF
[Unit]
Description=OpsPilot - 智能运维平台
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
ExecStart=/usr/bin/docker start $CONTAINER_NAME
ExecStop=/usr/bin/docker stop $CONTAINER_NAME
TimeoutStartSec=120

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    systemctl enable opspilot
    log_info "systemd 服务已注册"
}

# ── 打印摘要 ──────────────────────────────────────────────────────────────
print_summary() {
    local ip=$(curl -sf ifconfig.me 2>/dev/null || hostname -I 2>/dev/null | awk '{print $1}' || echo "your-server-ip")

    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}  OpsPilot 部署完成!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "  访问地址:  ${CYAN}http://${ip}:${PORT}${NC}"
    echo -e "  管理员:    ${YELLOW}${ADMIN_USER}${NC}"
    echo -e "  密码:      ${YELLOW}******${NC} (你刚才设置的)"
    echo ""
    echo -e "  常用命令:"
    echo -e "    启动:  ${CYAN}systemctl start opspilot${NC}"
    echo -e "    停止:  ${CYAN}systemctl stop opspilot${NC}"
    echo -e "    重启:  ${CYAN}systemctl restart opspilot${NC}"
    echo -e "    日志:  ${CYAN}docker logs -f $CONTAINER_NAME${NC}"
    echo -e "    状态:  ${CYAN}docker ps | grep $CONTAINER_NAME${NC}"
    echo ""

    if [ -z "$AI_PROVIDER" ]; then
        echo -e "  ${YELLOW}提示: 请在 Web 界面的「AI 功能 > 模型配置」中添加 AI 模型${NC}"
    fi
    echo ""
}

# ── 主流程 ────────────────────────────────────────────────────────────────
main() {
    echo ""
    echo -e "${CYAN}  ___  _  ____  ____    ____  _  _       ${NC}"
    echo -e "${CYAN} / _ \\| |/ ___||  _ \\  |  _ \\| || | ___  ${NC}"
    echo -e "${CYAN}| | | | |\\___ \\| |_) | | |_) | || |/ _ \\ ${NC}"
    echo -e "${CYAN}| |_| | | ___) |  __/  |  __/|__  | (_) |${NC}"
    echo -e "${CYAN} \\___/|_||____/|_|     |_|     |_| \\___/ ${NC}"
    echo ""
    echo -e "  ${BLUE}智能运维平台 - 单容器一键部署${NC}"
    echo ""

    check_root
    detect_os
    install_docker
    configure
    build_image
    start_container
    wait_ready
    create_admin
    configure_ai
    verify_deployment
    install_systemd
    print_summary
}

main "$@"
