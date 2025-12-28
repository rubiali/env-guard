# app/routers/api.py
# (sem alterações - já está correto)

from fastapi import APIRouter, UploadFile, File, Query
from fastapi.responses import JSONResponse

from app.core.validator import validate_env
from app.core.diff import compare_envs

router = APIRouter()


@router.post("/validate")
async def validate_env_file(
    file: UploadFile = File(...),
    schema: str = Query(default="generic"),
    schema_file: UploadFile | None = File(default=None),
):
    content = (await file.read()).decode("utf-8")

    schema_content = None
    if schema_file:
        schema_content = (await schema_file.read()).decode("utf-8")

    result = validate_env(
        content,
        schema_name=schema,
        custom_schema_content=schema_content,
    )

    return JSONResponse(content=result)


@router.post("/compare")
async def compare_env_files(
    env_a: UploadFile = File(...),
    env_b: UploadFile = File(...),
    schema: str = Query(default="generic"),
):
    content_a = (await env_a.read()).decode("utf-8")
    content_b = (await env_b.read()).decode("utf-8")

    result = compare_envs(
        content_a,
        content_b,
        schema_name=schema,
    )

    return JSONResponse(content=result)
