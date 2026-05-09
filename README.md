<div align="center">

<img src="https://img.shields.io/badge/Version-0.2.0-blue?style=flat-square" alt="version">
<img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="license">
<img src="https://img.shields.io/badge/Python-3.11+-yellow?style=flat-square" alt="python">
<img src="https://img.shields.io/badge/Node-20+-brightgreen?style=flat-square" alt="node">
<img src="https://img.shields.io/badge/Docker-Yes-blue?style=flat-square&logo=docker" alt="docker">

<h1>OpsPilot</h1>
<p><strong>AI 驱动的自托管运维部署平台 | AI-Driven Self-Hosted DevOps Platform</strong></p>

<p>
  <a href="#中文">中文</a> |
  <a href="#english">English</a>
</p>

<br>

<p>
  <strong>OpsPilot</strong> 是一个集成了 AI 能力的运维部署平台，支持从 Git 仓库一键部署应用到 Docker 容器，
  并提供 AI 驱动的日志分析、故障诊断和修复建议。
</p>

</div>

---

<a id="中文"></a>

# OpsPilot - 中文文档

## 功能特性

### 核心功能

- **一键部署** - 从 Git 仓库自动克隆、检测框架、构建镜像、分配端口、启动容器
- **实时日志** - WebSocket 实时推送部署日志，支持自动滚动和日志分级着色
- **项目管理** - 项目列表、搜索、筛选、分页、详情查看、删除
- **系统监控** - CPU、内存、磁盘使用率，Docker 容器状态，系统运行时间
- **用户认证** - JWT Token 认证，角色权限控制

### AI 能力

- **多模型接入** - 支持 OpenAI、Anthropic、Ollama 三种协议
- **日志分析** - AI 自动分析部署日志，总结问题和优化建议
- **故障诊断** - 深入分析故障根因，提供分步诊断方案
- **修复建议** - 提供具体的修复命令、配置变更和预防措施
- **连接测试** - 一键测试 AI 模型连接可用性

### 框架自动检测

自动识别项目框架并使用对应的构建策略：

| 框架 | 检测文件 | 构建方式 |
|------|---------|---------|
| React | `package.json` + React 依赖 | npm build + nginx |
| Vue | `package.json` + Vue 依赖 | npm build + nginx |
| Node.js | `package.json` | npm install + node |
| Python | `requirements.txt` / `pyproject.toml` | pip install + gunicorn |
| Django | Django 依赖 | gunicorn |
| Go | `go.mod` | go build |
| Java | `pom.xml` / `build.gradle` | maven/gradle build |
| Rust | `Cargo.toml` | cargo build |
| Docker | `Dockerfile` | docker build |

## 技术栈

<table>
<tr>
<td><strong>前端</strong></td>
<td>React 18 + TypeScript + Ant Design 5 + Zustand + Vite 5</td>
</tr>
<tr>
<td><strong>后端</strong></td>
<td>FastAPI + SQLAlchemy 2.0 (async) + Pydantic v2</td>
</tr>
<tr>
<td><strong>AI</strong></td>
<td>OpenAI SDK + Anthropic SDK + Ollama API (策略模式)</td>
</tr>
<tr>
<td><strong>数据库</strong></td>
<td>SQLite (默认) / PostgreSQL (生产)</td>
</tr>
<tr>
<td><strong>部署</strong></td>
<td>Docker + Nginx + Supervisor</td>
</tr>
<tr>
<td><strong>实时通信</strong></td>
<td>WebSocket (部署日志流)</td>
</tr>
<tr>
<td><strong>CLI</strong></td>
<td>Click + Rich</td>
</tr>
</table>

## 项目结构

```
OpsPilot/
├── frontend/                   # React 前端
│   ├── src/
│   │   ├── api/                # API 请求层 (Axios + TypeScript)
│   │   ├── components/         # 通用组件 (LogViewer, ProtectedRoute)
│   │   ├── hooks/              # 自定义 Hooks
│   │   ├── layouts/            # 布局组件 (ProLayout)
│   │   ├── stores/             # 状态管理 (Zustand)
│   │   ├── styles/             # 全局样式
│   │   └── views/              # 页面组件
│   ├── package.json
│   └── vite.config.js
├── backend/                    # FastAPI 后端
│   ├── app/
│   │   ├── api/v1/             # API 端点
│   │   ├── api/deps.py         # 依赖注入 (DB, Auth)
│   │   └── main.py             # 应用入口
│   └── pyproject.toml
├── packages/
│   └── opspilot_core/          # 核心共享库
│       ├── models/             # SQLAlchemy 数据模型
│       ├── schemas/            # Pydantic Schema
│       ├── services/           # 业务逻辑
│       └── utils/              # 工具函数
├── cli/                        # CLI 工具
├── nginx/                      # Nginx 配置
├── scripts/                    # 部署和开发脚本
├── Dockerfile.allinone          # 单容器部署
├── docker-compose.yml          # 多容器部署
└── README.md
```

## 快速开始

### 方式一：Linux 一键部署 (推荐)

```bash
# 克隆仓库
git clone git@github.com:hanhan1223/OpsPilot.git
cd OpsPilot

# 一键部署 (自动安装 Docker、配置端口、创建管理员)
sudo bash scripts/deploy.sh
```

部署脚本会自动完成：
- 检测系统并安装 Docker (已有则跳过)
- 检测端口占用 (被 Nginx 占用可自动停止)
- 交互式配置管理员用户名和密码 (带验证)
- 可选配置 AI 模型
- 构建单容器镜像 (Nginx + Backend)
- 启动服务并验证 (HTTP、API、登录、Docker Socket)
- 注册 systemd 服务 (开机自启)

### 方式二：Docker Compose 部署

```bash
git clone git@github.com:hanhan1223/OpsPilot.git
cd OpsPilot

# 配置环境变量
cp .env.example .env
# 编辑 .env 设置 SECRET_KEY 等

# 启动服务
docker compose up --build -d

# 访问 http://localhost
# 默认账号: admin / admin123
```

### 方式三：开发模式

```bash
# 安装后端依赖
./scripts/setup.sh

# 启动开发服务
./scripts/dev.sh

# 或分别启动
cd backend && uvicorn app.main:app --reload --port 8000
cd frontend && npm install && npm run dev
```

## API 文档

启动后端后访问 `http://localhost:8000/docs` 查看 Swagger API 文档。

### 主要端点

| 模块 | 端点 | 说明 |
|------|------|------|
| 认证 | `POST /api/v1/auth/login` | 用户登录 |
| 项目 | `GET /api/v1/projects/` | 项目列表 |
| 部署 | `POST /api/v1/deploy/` | 触发部署 |
| 系统 | `GET /api/v1/system/status` | 系统状态 |
| AI | `POST /api/v1/ai/analyze` | AI 分析 |
| AI | `POST /api/v1/ai/test-connection` | 测试连接 |
| AI | `GET /api/v1/ai/models` | 模型列表 |
| WebSocket | `WS /api/ws/deploy/{id}` | 部署日志流 |

## 运维命令

```bash
# 服务管理
systemctl start opspilot
systemctl stop opspilot
systemctl restart opspilot
systemctl status opspilot

# 查看日志
docker logs -f opspilot

# 更新版本
cd /opt/opspilot && git pull && systemctl restart opspilot

# 备份数据
cp -r /opt/opspilot/data /backup/opspilot-$(date +%Y%m%d)
```

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `OPSPILOT_SECRET_KEY` | JWT 密钥 | `change-me-in-production` |
| `OPSPILOT_DATABASE_URL` | 数据库连接 | `sqlite+aiosqlite:///./data/opspilot.db` |
| `OPSPILOT_DEPLOY_BASE_PATH` | 部署目录 | `./data/deployments` |
| `OPSPILOT_LOG_LEVEL` | 日志级别 | `INFO` |
| `OPSPILOT_CORS_ORIGINS` | CORS 允许源 | `["http://localhost"]` |

## License

MIT

---

<a id="english"></a>

# OpsPilot - English Documentation

## Features

### Core Features

- **One-Click Deploy** - Auto clone from Git, detect framework, build image, allocate port, start container
- **Real-time Logs** - WebSocket-powered live deployment log streaming with auto-scroll and level coloring
- **Project Management** - List, search, filter, paginate, view details, delete projects
- **System Monitoring** - CPU, memory, disk usage, Docker container status, system uptime
- **Authentication** - JWT token-based auth with role-based access control

### AI Capabilities

- **Multi-Provider Support** - OpenAI, Anthropic, and Ollama protocols
- **Log Analysis** - AI-powered deployment log analysis with issue summary and optimization suggestions
- **Fault Diagnosis** - Deep root cause analysis with step-by-step diagnosis procedures
- **Repair Suggestions** - Concrete fix commands, config changes, and prevention measures
- **Connection Testing** - One-click AI model connectivity verification

### Framework Auto-Detection

Automatically detects project frameworks and applies appropriate build strategies:

| Framework | Detection File | Build Method |
|-----------|---------------|--------------|
| React | `package.json` + React deps | npm build + nginx |
| Vue | `package.json` + Vue deps | npm build + nginx |
| Node.js | `package.json` | npm install + node |
| Python | `requirements.txt` / `pyproject.toml` | pip install + gunicorn |
| Django | Django deps | gunicorn |
| Go | `go.mod` | go build |
| Java | `pom.xml` / `build.gradle` | maven/gradle build |
| Rust | `Cargo.toml` | cargo build |
| Docker | `Dockerfile` | docker build |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + TypeScript + Ant Design 5 + Zustand + Vite 5 |
| **Backend** | FastAPI + SQLAlchemy 2.0 (async) + Pydantic v2 |
| **AI** | OpenAI SDK + Anthropic SDK + Ollama API (Strategy Pattern) |
| **Database** | SQLite (default) / PostgreSQL (production) |
| **Deployment** | Docker + Nginx + Supervisor |
| **Real-time** | WebSocket (deploy log streaming) |
| **CLI** | Click + Rich |

## Project Structure

```
OpsPilot/
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── api/                # API layer (Axios + TypeScript)
│   │   ├── components/         # Shared components (LogViewer, ProtectedRoute)
│   │   ├── hooks/              # Custom React hooks
│   │   ├── layouts/            # Layout components (ProLayout)
│   │   ├── stores/             # State management (Zustand)
│   │   ├── styles/             # Global styles
│   │   └── views/              # Page components
│   ├── package.json
│   └── vite.config.js
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── api/v1/             # API endpoints
│   │   ├── api/deps.py         # Dependency injection (DB, Auth)
│   │   └── main.py             # App entrypoint
│   └── pyproject.toml
├── packages/
│   └── opspilot_core/          # Shared core library
│       ├── models/             # SQLAlchemy data models
│       ├── schemas/            # Pydantic schemas
│       ├── services/           # Business logic
│       └── utils/              # Utility functions
├── cli/                        # CLI tool
├── nginx/                      # Nginx configuration
├── scripts/                    # Deploy and dev scripts
├── Dockerfile.allinone          # Single container deploy
├── docker-compose.yml          # Multi-container deploy
└── README.md
```

## Quick Start

### Option 1: One-Click Linux Deploy (Recommended)

```bash
# Clone repository
git clone git@github.com:hanhan1223/OpsPilot.git
cd OpsPilot

# One-click deploy (auto installs Docker, configures ports, creates admin)
sudo bash scripts/deploy.sh
```

The deploy script automatically:
- Detects OS and installs Docker (skips if already installed)
- Checks port availability (can stop conflicting Nginx)
- Interactive admin username/password setup (with validation)
- Optional AI model configuration
- Builds single container image (Nginx + Backend)
- Starts and verifies services (HTTP, API, Login, Docker Socket)
- Registers systemd service (auto-start on boot)

### Option 2: Docker Compose Deploy

```bash
git clone git@github.com:hanhan1223/OpsPilot.git
cd OpsPilot

# Configure environment
cp .env.example .env
# Edit .env to set SECRET_KEY, etc.

# Start services
docker compose up --build -d

# Access http://localhost
# Default credentials: admin / admin123
```

### Option 3: Development Mode

```bash
# Install backend dependencies
./scripts/setup.sh

# Start development servers
./scripts/dev.sh

# Or start separately
cd backend && uvicorn app.main:app --reload --port 8000
cd frontend && npm install && npm run dev
```

## API Documentation

After starting the backend, visit `http://localhost:8000/docs` for Swagger API documentation.

### Main Endpoints

| Module | Endpoint | Description |
|--------|----------|-------------|
| Auth | `POST /api/v1/auth/login` | User login |
| Projects | `GET /api/v1/projects/` | Project list |
| Deploy | `POST /api/v1/deploy/` | Trigger deployment |
| System | `GET /api/v1/system/status` | System status |
| AI | `POST /api/v1/ai/analyze` | AI analysis |
| AI | `POST /api/v1/ai/test-connection` | Test connection |
| AI | `GET /api/v1/ai/models` | List models |
| WebSocket | `WS /api/ws/deploy/{id}` | Deploy log stream |

## Operations

```bash
# Service management
systemctl start opspilot
systemctl stop opspilot
systemctl restart opspilot
systemctl status opspilot

# View logs
docker logs -f opspilot

# Update version
cd /opt/opspilot && git pull && systemctl restart opspilot

# Backup data
cp -r /opt/opspilot/data /backup/opspilot-$(date +%Y%m%d)
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPSPILOT_SECRET_KEY` | JWT secret key | `change-me-in-production` |
| `OPSPILOT_DATABASE_URL` | Database connection string | `sqlite+aiosqlite:///./data/opspilot.db` |
| `OPSPILOT_DEPLOY_BASE_PATH` | Deployment directory | `./data/deployments` |
| `OPSPILOT_LOG_LEVEL` | Log level | `INFO` |
| `OPSPILOT_CORS_ORIGINS` | CORS allowed origins | `["http://localhost"]` |

## License

MIT
