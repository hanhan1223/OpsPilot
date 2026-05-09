# OpsPilot

AI-driven self-hosted automation ops and GitHub auto-deployment platform.

## Tech Stack

- **Backend**: FastAPI + SQLAlchemy 2.0 (async) + Pydantic v2
- **Frontend**: React 18 + TypeScript + Ant Design 5 + Zustand
- **CLI**: Click + Rich
- **AI**: 支持 OpenAI / Anthropic / Ollama 多协议接入
- **Database**: SQLite (MVP) / PostgreSQL (production)
- **Deployment**: Docker Compose + Nginx

## Quick Start (Linux 一键部署)

```bash
# 从源码目录执行
sudo bash scripts/deploy.sh
```

脚本会自动完成：
- 安装 Docker + Docker Compose
- 交互式配置（域名、端口、AI Provider）
- 构建并启动所有服务
- 注册 systemd 服务（开机自启）
- 可选：Let's Encrypt HTTPS

部署完成后访问 `http://your-server`，默认账号 `admin` / `admin123`。

## 手动部署

```bash
# 复制配置
cp .env.example .env
# 编辑 .env 设置 SECRET_KEY 等配置

# 启动
docker compose up --build -d

# 访问
# Web UI: http://localhost
# API: http://localhost:8000
# Default login: admin / admin123
```

## AI 模型配置

OpsPilot 支持三种 AI Provider，在 Web 界面的 **AI 功能 > 模型配置** 中添加：

| Provider | 说明 | 需要 API Key |
|----------|------|:---:|
| OpenAI | GPT-4o 等，支持任何 OpenAI 兼容端点 | 是 |
| Anthropic | Claude 系列模型 | 是 |
| Ollama | 自建本地模型服务 | 否 |

## Development Setup

```bash
# 安装后端依赖
./scripts/setup.sh

# 启动开发服务
./scripts/dev.sh

# 或分别启动
cd backend && uvicorn app.main:app --reload --port 8000
cd frontend && npm install && npm run dev
```

## CLI Usage

```bash
pip install -e ./cli

opspilot deploy up https://github.com/user/repo
opspilot project list
opspilot ai analyze my-project
opspilot system status
```

## 常用运维命令

```bash
# 查看服务状态
systemctl status opspilot

# 重启服务
systemctl restart opspilot

# 查看日志
cd /opt/opspilot && docker compose -f docker-compose.prod.yml logs -f

# 更新版本
cd /opt/opspilot && git pull && systemctl restart opspilot
```

## License

MIT
