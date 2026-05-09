from fastapi import APIRouter, HTTPException, Query
from sqlalchemy import select

from opspilot_core.models import AIConfig, AIReport
from opspilot_core.schemas import (
    AIConfigCreate, AIConfigResponse, AIReportResponse,
    AIAnalyzeRequest, AITestConnectionRequest, AITestConnectionResponse,
)
from opspilot_core.services.ai_service import AIService
from app.api.deps import DBSession, CurrentUser

router = APIRouter()


@router.get("/configs", response_model=list[AIConfigResponse])
async def list_ai_configs(db: DBSession, current_user: CurrentUser):
    result = await db.execute(select(AIConfig).order_by(AIConfig.is_default.desc()))
    return result.scalars().all()


@router.post("/configs", response_model=AIConfigResponse)
async def create_ai_config(config: AIConfigCreate, db: DBSession, current_user: CurrentUser):
    if config.is_default:
        await db.execute(
            AIConfig.__table__.update().values(is_default=False)
        )

    db_config = AIConfig(**config.model_dump())
    db.add(db_config)
    await db.commit()
    await db.refresh(db_config)
    return db_config


@router.put("/configs/{config_id}", response_model=AIConfigResponse)
async def update_ai_config(config_id: int, config: AIConfigCreate, db: DBSession, current_user: CurrentUser):
    result = await db.execute(select(AIConfig).where(AIConfig.id == config_id))
    db_config = result.scalar_one_or_none()
    if not db_config:
        raise HTTPException(status_code=404, detail="Config not found")

    if config.is_default:
        await db.execute(AIConfig.__table__.update().values(is_default=False))

    for key, value in config.model_dump().items():
        setattr(db_config, key, value)

    await db.commit()
    await db.refresh(db_config)
    return db_config


@router.delete("/configs/{config_id}")
async def delete_ai_config(config_id: int, db: DBSession, current_user: CurrentUser):
    result = await db.execute(select(AIConfig).where(AIConfig.id == config_id))
    db_config = result.scalar_one_or_none()
    if not db_config:
        raise HTTPException(status_code=404, detail="Config not found")

    await db.delete(db_config)
    await db.commit()
    return {"message": "Config deleted"}


@router.post("/configs/{config_id}/set-default")
async def set_default_config(config_id: int, db: DBSession, current_user: CurrentUser):
    result = await db.execute(select(AIConfig).where(AIConfig.id == config_id))
    db_config = result.scalar_one_or_none()
    if not db_config:
        raise HTTPException(status_code=404, detail="Config not found")

    await db.execute(AIConfig.__table__.update().values(is_default=False))
    db_config.is_default = True
    await db.commit()
    return {"message": "Default config updated"}


@router.post("/test-connection", response_model=AITestConnectionResponse)
async def test_ai_connection(request: AITestConnectionRequest, current_user: CurrentUser):
    service = AIService()
    try:
        result = await service.test_connection(
            provider=request.provider,
            base_url=request.base_url,
            model_name=request.model_name,
            api_key=request.api_key,
        )
        return result
    except Exception as e:
        return AITestConnectionResponse(success=False, message=str(e))


@router.post("/analyze", response_model=AIReportResponse)
async def analyze(request: AIAnalyzeRequest, db: DBSession, current_user: CurrentUser):
    config = None
    if request.config_id:
        result = await db.execute(select(AIConfig).where(AIConfig.id == request.config_id))
        config = result.scalar_one_or_none()
    else:
        result = await db.execute(select(AIConfig).where(AIConfig.is_default == True))
        config = result.scalar_one_or_none()

    if not config:
        raise HTTPException(status_code=400, detail="No AI config available")

    service = AIService()
    try:
        analysis = await service.analyze_project(
            db=db,
            project_id=request.project_id,
            report_type=request.report_type,
            config=config,
        )
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/reports", response_model=list[AIReportResponse])
async def list_reports(
    db: DBSession,
    current_user: CurrentUser,
    project_id: int | None = Query(None),
    report_type: str | None = Query(None),
):
    query = select(AIReport).order_by(AIReport.created_at.desc())
    if project_id:
        query = query.where(AIReport.project_id == project_id)
    if report_type:
        query = query.where(AIReport.report_type == report_type)

    result = await db.execute(query.limit(50))
    return result.scalars().all()


@router.get("/models")
async def list_available_models(
    current_user: CurrentUser,
    base_url: str = Query("http://localhost:11434"),
    provider: str = Query("ollama"),
):
    service = AIService()
    try:
        models = await service.list_models(provider=provider, base_url=base_url)
        return {"models": models}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
