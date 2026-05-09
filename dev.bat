@echo off
chcp 65001 >nul 2>&1
title OpsPilot Dev Server

echo.
echo   OpsPilot - Starting development mode...
echo.

:: Kill existing processes on ports
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do (
    echo [^*] Port 8000 in use, stopping PID %%a...
    taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    echo [^*] Port 3000 in use, stopping PID %%a...
    taskkill /F /PID %%a >nul 2>&1
)

:: Start backend
echo [1/2] Starting backend ^(port 8000^)...
start "OpsPilot-Backend" /D "%~dp0backend" conda run --no-banner -n opspilot uvicorn app.main:app --reload --port 8000

:: Start frontend
echo [2/2] Starting frontend ^(port 3000^)...
start "OpsPilot-Frontend" /D "%~dp0frontend" npm run dev

echo.
echo   Backend  - http://localhost:8000
echo   Frontend - http://localhost:3000
echo.
echo   Close this window or press Ctrl+C to stop.
echo.
pause >nul
