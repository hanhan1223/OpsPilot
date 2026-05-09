import socket
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..models import Project
from ..config import settings
from ..exceptions import ConflictError


async def allocate_port(db: AsyncSession) -> int:
    result = await db.execute(select(Project.port))
    used_ports = {row[0] for row in result.all()}

    for port in range(settings.PORT_RANGE_START, settings.PORT_RANGE_END + 1):
        if port in used_ports:
            continue
        if is_port_available(port):
            return port

    raise ConflictError("No available ports in configured range")


def is_port_available(port: int) -> bool:
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.bind(("", port))
            return True
    except OSError:
        return False
