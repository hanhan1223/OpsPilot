from fastapi import APIRouter

from .v1 import auth, projects, deploy, system, logs, ai

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(deploy.router, prefix="/deploy", tags=["deploy"])
api_router.include_router(system.router, prefix="/system", tags=["system"])
api_router.include_router(logs.router, prefix="/logs", tags=["logs"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
