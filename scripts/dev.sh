#!/bin/bash
set -e

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo ""
echo "  ___  _  ____  ____    ____  _  _       "
echo " / _ \| |/ ___||  _ \  |  _ \| || | ___  "
echo "| | | | |\___ \| |_) | | |_) | || |/ _ \ "
echo "| |_| | | ___) |  __/  |  __/|__  | (_) |"
echo " \___/|_||____/|_|     |_|     |_| \___/ "
echo ""
echo "  Starting in development mode..."
echo ""

# ── Kill existing processes on ports ──
for port in 8000 3000; do
  pid=$(lsof -ti :$port 2>/dev/null || true)
  if [ -n "$pid" ]; then
    echo "[*] Port $port in use (PID $pid), stopping..."
    kill $pid 2>/dev/null || true
    sleep 1
  fi
done

# ── Start backend ──
echo "[1/2] Starting backend (port 8000)..."
cd "$PROJECT_DIR/backend"
conda run --no-banner -n opspilot uvicorn app.main:app --reload --port 8000 &
BACKEND_PID=$!
cd "$PROJECT_DIR"

# ── Start frontend ──
echo "[2/2] Starting frontend (port 3000)..."
cd "$PROJECT_DIR/frontend"
npm run dev &
FRONTEND_PID=$!
cd "$PROJECT_DIR"

# ── Wait for services ──
echo ""
for i in $(seq 1 15); do
  if curl -sf http://localhost:8000/health > /dev/null 2>&1; then
    echo "[OK] Backend  -> http://localhost:8000"
    break
  fi
  sleep 1
done

for i in $(seq 1 15); do
  if curl -sf http://localhost:3000 > /dev/null 2>&1; then
    echo "[OK] Frontend -> http://localhost:3000"
    break
  fi
  sleep 1
done

echo ""
echo "  Press Ctrl+C to stop all services"
echo ""

# ── Cleanup on exit ──
trap "echo ''; echo 'Stopping...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait
