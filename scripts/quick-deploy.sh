#!/bin/bash
set -e

# ============================================================================
# OpsPilot 一键部署入口
# 用法: curl -fsSL https://raw.githubusercontent.com/hanhan1223/OpsPilot/main/scripts/quick-deploy.sh | sudo bash
# ============================================================================

REPO="https://github.com/hanhan1223/OpsPilot.git"
INSTALL_DIR="/opt/opspilot"

echo ""
echo "  ___  _  ____  ____    ____  _  _       "
echo " / _ \| |/ ___||  _ \  |  _ \| || | ___  "
echo "| | | | |\___ \| |_) | | |_) | || |/ _ \ "
echo "| |_| | | ___) |  __/  |  __/|__  | (_) |"
echo " \___/|_||____/|_|     |_|     |_| \___/ "
echo ""
echo "  AI-Driven Self-Hosted DevOps Platform"
echo ""

# Check root
if [ "$(id -u)" -ne 0 ]; then
    echo "[ERROR] Please run as root: curl -fsSL ... | sudo bash"
    exit 1
fi

# Install git if missing
if ! command -v git &> /dev/null; then
    echo "[*] Installing git..."
    if command -v apt-get &> /dev/null; then
        apt-get update -qq && apt-get install -y -qq git
    elif command -v yum &> /dev/null; then
        yum install -y -q git
    elif command -v dnf &> /dev/null; then
        dnf install -y -q git
    elif command -v pacman &> /dev/null; then
        pacman -Sy --noconfirm git
    else
        echo "[ERROR] Cannot install git. Please install manually."
        exit 1
    fi
fi

# Clone or update
if [ -d "$INSTALL_DIR/.git" ]; then
    echo "[*] Existing installation found, updating..."
    cd "$INSTALL_DIR"
    git pull --ff-only
else
    echo "[*] Cloning OpsPilot to $INSTALL_DIR..."
    rm -rf "$INSTALL_DIR"
    git clone --depth 1 "$REPO" "$INSTALL_DIR"
fi

# Run deploy
cd "$INSTALL_DIR"
exec bash scripts/deploy.sh
