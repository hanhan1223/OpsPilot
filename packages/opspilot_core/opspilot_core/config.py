from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    """OpsPilot application settings."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_prefix="OPSPILOT_",
        case_sensitive=False,
    )

    # App
    APP_NAME: str = "OpsPilot"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./data/opspilot.db"

    # Security
    SECRET_KEY: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 1440

    # Deploy
    DEPLOY_BASE_PATH: str = "./data/deployments"
    DOCKER_NETWORK: str = "opspilot-network"
    PORT_RANGE_START: int = 10000
    PORT_RANGE_END: int = 19999

    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "./data/logs/opspilot.log"

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost", "http://localhost:80"]

    # AI Configuration
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3"


settings = Settings()
