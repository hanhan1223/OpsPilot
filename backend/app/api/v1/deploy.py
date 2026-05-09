import asyncio
from fastapi import APIRouter, HTTPException
from sqlalchemy import select

from opspilot_core.models import Project, DeployRecord
from opspilot_core.schemas import DeployRequest, DeployResponse
from opspilot_core.utils.path_utils import sanitize_repo_name
from app.api.deps import DBSession, CurrentUser

router = APIRouter()


@router.post("/", response_model=DeployResponse)
async def trigger_deploy(request: DeployRequest, db: DBSession, current_user: CurrentUser):
    project_name = request.project_name or sanitize_repo_name(request.repo_url)

    existing = await db.execute(select(Project).where(Project.name == project_name))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Project name already exists")

    project = Project(
        name=project_name,
        repo_url=request.repo_url,
        branch=request.branch,
        deploy_path=f"./data/deployments/{project_name}",
        container_name=f"opspilot-{project_name}",
        port=0,
        status="pending",
    )
    db.add(project)
    await db.flush()

    deploy_record = DeployRecord(
        project_id=project.id,
        status="pending",
        trigger_type="api",
    )
    db.add(deploy_record)
    await db.commit()
    await db.refresh(project)
    await db.refresh(deploy_record)

    asyncio.create_task(run_deployment(project.id, deploy_record.id))

    return DeployResponse(
        project_id=project.id,
        deploy_id=deploy_record.id,
        status="pending",
        message="Deployment started",
    )


async def run_deployment(project_id: int, deploy_id: int):
    from opspilot_core.database import async_session_factory
    from opspilot_core.services.deploy_service import DeployService

    async with async_session_factory() as db:
        service = DeployService(db)
        await service.run_deploy(project_id, deploy_id)
