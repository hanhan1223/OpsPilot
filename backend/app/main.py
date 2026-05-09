import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from opspilot_core.config import settings
from opspilot_core.database import init_db, async_session_factory
from opspilot_core.logging import setup_logging
from opspilot_core.exceptions import OpsPilotError, ops_pilot_error_handler
from opspilot_core.models import User
from opspilot_core.core.security import hash_password

from app.api.router import api_router


async def seed_admin_user():
    from sqlalchemy import select
    async with async_session_factory() as session:
        result = await session.execute(select(User).where(User.username == "admin"))
        if not result.scalar_one_or_none():
            admin = User(
                username="admin",
                password_hash=hash_password("admin123"),
                role="admin",
            )
            session.add(admin)
            await session.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    await init_db()
    await seed_admin_user()
    yield


app = FastAPI(
    title="OpsPilot API",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(OpsPilotError, ops_pilot_error_handler)
app.include_router(api_router, prefix="/api/v1")


@app.get("/health")
async def health():
    return {"status": "ok"}


def run():
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=settings.DEBUG)
