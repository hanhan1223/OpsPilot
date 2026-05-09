import asyncio
from opspilot_core.database import async_session_factory, init_db
from opspilot_core.models import User
from opspilot_core.core.security import hash_password
from sqlalchemy import select


async def seed():
    await init_db()
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
            print("Admin user created: admin/admin123")
        else:
            print("Admin user already exists")


if __name__ == "__main__":
    asyncio.run(seed())
