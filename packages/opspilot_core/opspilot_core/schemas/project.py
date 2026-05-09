from datetime import datetime
from pydantic import BaseModel, ConfigDict


class ProjectCreate(BaseModel):
    name: str
    repo_url: str
    branch: str = "main"


class ProjectResponse(BaseModel):
    id: int
    name: str
    repo_url: str
    branch: str
    framework: str | None
    deploy_path: str
    container_id: str | None
    container_name: str
    port: int
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProjectListResponse(BaseModel):
    items: list[ProjectResponse]
    total: int
    page: int
    page_size: int
