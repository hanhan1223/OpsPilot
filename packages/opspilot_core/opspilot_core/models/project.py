from datetime import datetime
from sqlalchemy import String, Integer, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base, TimestampMixin


class Project(Base, TimestampMixin):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(128))
    repo_url: Mapped[str] = mapped_column(String(512))
    branch: Mapped[str] = mapped_column(String(128), default="main")
    framework: Mapped[str | None] = mapped_column(String(32), nullable=True)
    deploy_path: Mapped[str] = mapped_column(String(512))
    container_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    container_name: Mapped[str] = mapped_column(String(128), unique=True)
    port: Mapped[int] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(16), default="pending")

    deploy_records = relationship("DeployRecord", back_populates="project", cascade="all, delete-orphan")
    ai_reports = relationship("AIReport", back_populates="project", cascade="all, delete-orphan")
