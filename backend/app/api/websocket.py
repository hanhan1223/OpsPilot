import asyncio
import json
import time

import psutil
import docker
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from jose import JWTError, jwt

from opspilot_core.config import settings
from opspilot_core.schemas import DockerStats
from app.websocket.manager import ws_manager

router = APIRouter()

_start_time = time.time()


def _collect_system_status() -> dict:
    cpu_percent = psutil.cpu_percent(interval=0)
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage("/")

    docker_running = 0
    docker_stopped = 0
    try:
        client = docker.from_env()
        containers = client.containers.list(all=True)
        for c in containers:
            if c.status == "running":
                docker_running += 1
            else:
                docker_stopped += 1
        client.close()
    except Exception:
        pass

    return {
        "cpu_percent": cpu_percent,
        "memory_percent": memory.percent,
        "disk_percent": disk.percent,
        "docker": {
            "running": docker_running,
            "stopped": docker_stopped,
            "total": docker_running + docker_stopped,
        },
        "projects_online": docker_running,
        "uptime_seconds": time.time() - _start_time,
    }


def _verify_ws_token(token: str) -> bool:
    try:
        jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return True
    except JWTError:
        return False


@router.websocket("/system")
async def system_status_ws(websocket: WebSocket):
    token = websocket.query_params.get("token", "")
    if not _verify_ws_token(token):
        await websocket.close(code=4001, reason="Unauthorized")
        return

    await websocket.accept()
    room = "system:status"
    ws_manager._rooms.setdefault(room, [])
    ws_manager._rooms[room].append(websocket)

    try:
        while True:
            status = _collect_system_status()
            try:
                await websocket.send_json(status)
            except Exception:
                break
            await asyncio.sleep(2)
    except WebSocketDisconnect:
        pass
    finally:
        ws_manager.disconnect(websocket, room)


@router.websocket("/deploy/{deploy_id}")
async def deploy_logs_ws(websocket: WebSocket, deploy_id: int):
    room = f"deploy:{deploy_id}"
    await ws_manager.connect(websocket, room)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, room)
