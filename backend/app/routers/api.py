from fastapi import APIRouter

router = APIRouter(prefix="/api")

@router.post("/validate")
async def validate_env():
    ...
