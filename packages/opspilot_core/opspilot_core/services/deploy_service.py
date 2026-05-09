import asyncio
from datetime import datetime
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..models import Project, DeployRecord
from ..exceptions import DeployError
from ..utils.port_allocator import allocate_port
from ..utils.path_utils import sanitize_repo_name
from .docker_service import DockerService
from .github_service import GitHubService


class DeployService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.docker = DockerService()
        self.github = GitHubService()

    async def run_deploy(self, project_id: int, deploy_id: int):
        project_result = await self.db.execute(
            select(Project).where(Project.id == project_id)
        )
        project = project_result.scalar_one_or_none()
        deploy_result = await self.db.execute(
            select(DeployRecord).where(DeployRecord.id == deploy_id)
        )
        deploy = deploy_result.scalar_one_or_none()

        if not project or not deploy:
            return

        try:
            deploy.status = "in_progress"
            project.status = "cloning"
            await self.db.commit()
            await self._append_log(deploy, "Cloning repository...")

            await self.github.clone_repo(project.repo_url, project.deploy_path, project.branch)
            await self._append_log(deploy, "Repository cloned successfully.")

            framework = await self.github.detect_framework(project.deploy_path)
            project.framework = framework
            await self._append_log(deploy, f"Detected framework: {framework}")

            project.status = "building"
            await self.db.commit()
            await self._append_log(deploy, "Building Docker image...")

            image_tag = f"opspilot-{project.name}:latest"
            await self.docker.build_image(project.deploy_path, image_tag)
            await self._append_log(deploy, "Docker image built successfully.")

            project.status = "starting"
            await self.db.commit()
            await self._append_log(deploy, "Starting container...")

            port = await allocate_port(self.db)
            container = await self.docker.run_container(
                image=image_tag,
                name=project.container_name,
                port=port,
            )

            project.container_id = container.id[:12]
            project.port = port
            project.status = "running"
            deploy.status = "success"
            deploy.end_time = datetime.utcnow()
            await self.db.commit()

            await self._append_log(deploy, f"Deployment successful! Access at http://localhost:{port}")

        except Exception as e:
            logger.error(f"Deployment failed: {e}")
            project.status = "error"
            deploy.status = "failed"
            deploy.error_message = str(e)
            deploy.end_time = datetime.utcnow()
            await self.db.commit()
            await self._append_log(deploy, f"Deployment failed: {str(e)}")

    async def _append_log(self, deploy: DeployRecord, line: str):
        timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        log_line = f"[{timestamp}] {line}"
        if deploy.logs:
            deploy.logs += f"\n{log_line}"
        else:
            deploy.logs = log_line
        await self.db.commit()
