import psutil
import docker
from fastapi import APIRouter

from opspilot_core.schemas import SystemStatusResponse, DockerStats
from app.api.deps import CurrentUser

router = APIRouter()

import time
_start_time = time.time()


@router.get("/status", response_model=SystemStatusResponse)
async def get_system_status(current_user: CurrentUser):
    cpu_percent = psutil.cpu_percent(interval=0.1)
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

    return SystemStatusResponse(
        cpu_percent=cpu_percent,
        memory_percent=memory.percent,
        disk_percent=disk.percent,
        docker=DockerStats(
            running=docker_running,
            stopped=docker_stopped,
            total=docker_running + docker_stopped,
        ),
        projects_online=docker_running,
        uptime_seconds=time.time() - _start_time,
    )
