from fastapi import APIRouter, HTTPException, Query
from sqlalchemy import select

from opspilot_core.models import DeployRecord
from opspilot_core.schemas import DeployRecordResponse
from app.api.deps import DBSession, CurrentUser

router = APIRouter()


@router.get("/{project_id}", response_model=DeployRecordResponse)
async def get_project_logs(
    project_id: int,
    db: DBSession,
    current_user: CurrentUser,
    deploy_id: int | None = Query(None),
):
    query = select(DeployRecord).where(DeployRecord.project_id == project_id)

    if deploy_id:
        query = query.where(DeployRecord.id == deploy_id)
    else:
        query = query.order_by(DeployRecord.id.desc())

    result = await db.execute(query.limit(1))
    record = result.scalar_one_or_none()

    if not record:
        raise HTTPException(status_code=404, detail="No deployment records found")

    return record
