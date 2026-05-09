from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from opspilot_core.database import get_db
from opspilot_core.models import User
from opspilot_core.schemas import LoginRequest, TokenResponse, UserResponse
from opspilot_core.core.security import verify_password, create_access_token
from app.api.deps import DBSession, CurrentUser

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, db: DBSession):
    result = await db.execute(select(User).where(User.username == request.username))
    user = result.scalar_one_or_none()

    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    access_token = create_access_token(data={"sub": str(user.id)})
    return TokenResponse(access_token=access_token)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: CurrentUser):
    return current_user
