from datetime import datetime
from sqlalchemy import String, Integer, Text, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base


class CLIRecord(Base):
    __tablename__ = "cli_records"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    command: Mapped[str] = mapped_column(String(512))
    status: Mapped[str] = mapped_column(String(16))
    logs: Mapped[str | None] = mapped_column(Text, nullable=True)
    execute_time: Mapped[datetime] = mapped_column(server_default=func.now())
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))

    user = relationship("User", back_populates="cli_records")
