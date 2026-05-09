from datetime import datetime
from sqlalchemy import String, Float, Boolean, func
from sqlalchemy.orm import Mapped, mapped_column
from .base import Base, TimestampMixin


class AIConfig(Base, TimestampMixin):
    __tablename__ = "ai_configs"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(64))
    provider: Mapped[str] = mapped_column(String(32), default="ollama")
    model_name: Mapped[str] = mapped_column(String(128))
    base_url: Mapped[str] = mapped_column(String(256))
    api_key: Mapped[str | None] = mapped_column(String(256), nullable=True)
    temperature: Mapped[float] = mapped_column(Float, default=0.7)
    max_tokens: Mapped[int] = mapped_column(default=4096)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False)
