from datetime import datetime
from pydantic import BaseModel, ConfigDict, field_validator


class AIConfigCreate(BaseModel):
    name: str
    provider: str = "ollama"
    model_name: str
    base_url: str = "http://localhost:11434"
    api_key: str | None = None
    temperature: float = 0.7
    max_tokens: int = 4096
    is_default: bool = False

    @field_validator("provider")
    @classmethod
    def validate_provider(cls, v: str) -> str:
        allowed = ["ollama", "openai", "anthropic"]
        if v not in allowed:
            raise ValueError(f"provider must be one of {allowed}")
        return v


class AIConfigResponse(BaseModel):
    id: int
    name: str
    provider: str
    model_name: str
    base_url: str
    temperature: float
    max_tokens: int
    is_default: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AIReportResponse(BaseModel):
    id: int
    project_id: int | None
    config_id: int | None
    report_type: str
    content: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AIAnalyzeRequest(BaseModel):
    project_id: int
    report_type: str = "log_analysis"
    config_id: int | None = None


class AITestConnectionRequest(BaseModel):
    provider: str = "ollama"
    base_url: str
    model_name: str
    api_key: str | None = None


class AITestConnectionResponse(BaseModel):
    success: bool
    message: str
    models: list[str] = []
