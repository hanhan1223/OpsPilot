from pydantic import BaseModel


class DockerStats(BaseModel):
    running: int
    stopped: int
    total: int


class SystemStatusResponse(BaseModel):
    cpu_percent: float
    memory_percent: float
    disk_percent: float
    docker: DockerStats
    projects_online: int
    uptime_seconds: float
