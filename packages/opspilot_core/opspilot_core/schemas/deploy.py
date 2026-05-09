from datetime import datetime
from pydantic import BaseModel, ConfigDict


class DeployRequest(BaseModel):
    repo_url: str
    branch: str = "main"
    project_name: str | None = None


class DeployResponse(BaseModel):
    project_id: int
    deploy_id: int
    status: str
    message: str


class DeployRecordResponse(BaseModel):
    id: int
    project_id: int
    status: str
    logs: str | None
    start_time: datetime
    end_time: datetime | None
    trigger_type: str
    error_message: str | None

    model_config = ConfigDict(from_attributes=True)
