from datetime import datetime
from sqlalchemy import String, Integer, Text, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base


class DeployRecord(Base):
    __tablename__ = "deploy_records"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"))
    status: Mapped[str] = mapped_column(String(16), default="pending")
    logs: Mapped[str | None] = mapped_column(Text, nullable=True)
    start_time: Mapped[datetime] = mapped_column(server_default=func.now())
    end_time: Mapped[datetime | None] = mapped_column(nullable=True)
    trigger_type: Mapped[str] = mapped_column(String(16), default="api")
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)

    project = relationship("Project", back_populates="deploy_records")
