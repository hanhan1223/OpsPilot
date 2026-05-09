<div align="center">

<img src="https://img.shields.io/badge/Version-0.2.0-blue?style=flat-square" alt="version">
<img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="license">
<img src="https://img.shields.io/badge/Python-3.11+-yellow?style=flat-square" alt="python">
<img src="https://img.shields.io/badge/Node-20+-brightgreen?style=flat-square" alt="node">
<img src="https://img.shields.io/badge/Docker-Yes-blue?style=flat-square&logo=docker" alt="docker">

<h1>OpsPilot</h1>
<p><strong>AI-Driven Self-Hosted DevOps Platform</strong></p>

<p>
  <a href="README.md">中文</a> |
  <strong>English</strong>
</p>

<br>

<p>
  <strong>OpsPilot</strong> is an AI-powered DevOps platform that enables one-click deployment of applications
  from Git repositories to Docker containers, with AI-driven log analysis, fault diagnosis, and repair suggestions.
</p>

</div>

---

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
