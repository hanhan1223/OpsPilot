import asyncio
import docker
from loguru import logger
from ..exceptions import DockerError


class DockerService:
    def __init__(self):
        self._client = None

    @property
    def client(self):
        if self._client is None:
            self._client = docker.from_env()
        return self._client

    async def build_image(self, path: str, tag: str) -> str:
        def _build():
            try:
                image, logs = self.client.images.build(path=path, tag=tag, rm=True)
                return image.id
            except docker.errors.BuildError as e:
                raise DockerError(f"Build failed: {e}")
            except Exception as e:
                raise DockerError(f"Build error: {e}")

        return await asyncio.to_thread(_build)

    async def run_container(self, image: str, name: str, port: int) -> docker.models.containers.Container:
        def _run():
            try:
                container = self.client.containers.run(
                    image,
                    name=name,
                    ports={f"{port}/tcp": port},
                    detach=True,
                    restart_policy={"Name": "unless-stopped"},
                    labels={"opspilot": "true"},
                )
                return container
            except docker.errors.APIError as e:
                raise DockerError(f"Container run failed: {e}")

        return await asyncio.to_thread(_run)

    async def stop_container(self, container_id: str):
        def _stop():
            try:
                container = self.client.containers.get(container_id)
                container.stop(timeout=10)
            except docker.errors.NotFound:
                pass
            except Exception as e:
                raise DockerError(f"Stop failed: {e}")

        await asyncio.to_thread(_stop)

    async def remove_container(self, container_id: str, force: bool = True):
        def _remove():
            try:
                container = self.client.containers.get(container_id)
                container.remove(force=force)
            except docker.errors.NotFound:
                pass
            except Exception as e:
                raise DockerError(f"Remove failed: {e}")

        await asyncio.to_thread(_remove)

    async def get_container_logs(self, container_id: str, tail: int = 100) -> str:
        def _logs():
            try:
                container = self.client.containers.get(container_id)
                return container.logs(tail=tail).decode("utf-8", errors="replace")
            except docker.errors.NotFound:
                return ""
            except Exception as e:
                raise DockerError(f"Logs failed: {e}")

        return await asyncio.to_thread(_logs)

    async def get_container_status(self, container_id: str) -> str:
        def _status():
            try:
                container = self.client.containers.get(container_id)
                return container.status
            except docker.errors.NotFound:
                return "not_found"

        return await asyncio.to_thread(_status)
