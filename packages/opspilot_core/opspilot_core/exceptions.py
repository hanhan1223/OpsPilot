from fastapi import Request
from fastapi.responses import JSONResponse


class OpsPilotError(Exception):
    """Base exception for OpsPilot."""

    def __init__(self, message: str, code: str = "INTERNAL_ERROR"):
        self.message = message
        self.code = code
        super().__init__(message)


class NotFoundError(OpsPilotError):
    def __init__(self, message: str = "Resource not found"):
        super().__init__(message, code="NOT_FOUND")


class ConflictError(OpsPilotError):
    def __init__(self, message: str = "Resource conflict"):
        super().__init__(message, code="CONFLICT")


class DeployError(OpsPilotError):
    def __init__(self, message: str = "Deployment failed"):
        super().__init__(message, code="DEPLOY_ERROR")


class DockerError(OpsPilotError):
    def __init__(self, message: str = "Docker operation failed"):
        super().__init__(message, code="DOCKER_ERROR")


class AuthError(OpsPilotError):
    def __init__(self, message: str = "Authentication failed"):
        super().__init__(message, code="AUTH_ERROR")


class AIError(OpsPilotError):
    def __init__(self, message: str = "AI operation failed"):
        super().__init__(message, code="AI_ERROR")


async def ops_pilot_error_handler(request: Request, exc: OpsPilotError):
    status_codes = {
        "NOT_FOUND": 404,
        "CONFLICT": 409,
        "AUTH_ERROR": 401,
        "DEPLOY_ERROR": 500,
        "DOCKER_ERROR": 500,
        "AI_ERROR": 500,
        "INTERNAL_ERROR": 500,
    }
    status_code = status_codes.get(exc.code, 500)
    return JSONResponse(
        status_code=status_code,
        content={"detail": {"code": exc.code, "message": exc.message}},
    )
