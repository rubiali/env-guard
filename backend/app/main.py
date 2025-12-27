# backend/app/main.py

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse

from app.core.validator import validate_env
from app.core.parser import EnvParseError
from app.core.schema import SchemaLoadError
from fastapi import UploadFile, File
from app.core.diff import compare_envs


SCHEMA_PATH = "app/schemas/schema.yaml"

app = FastAPI(
    title="Env-Guard",
    description="Validate .env files against a fixed schema",
    version="0.1.0"
)


@app.post("/validate")
async def validate_env_file(file: UploadFile = File(...)):
    if not file.filename.endswith(".env"):
        raise HTTPException(status_code=400, detail="Only .env files are allowed")

    try:
        content = (await file.read()).decode("utf-8")
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="Invalid file encoding")

    try:
        result = validate_env(content, SCHEMA_PATH)
        return JSONResponse(content=result)

    except EnvParseError as e:
        raise HTTPException(status_code=400, detail=str(e))

    except SchemaLoadError as e:
        raise HTTPException(status_code=500, detail=str(e))

    except Exception as e:
        # fallback defensivo
        raise HTTPException(status_code=500, detail=f"Unexpected error: {e}")

@app.post("/compare")
async def compare_env_files(
    env_a: UploadFile = File(...),
    env_b: UploadFile = File(...)
):
    for f in (env_a, env_b):
        if not f.filename.endswith(".env"):
            raise HTTPException(status_code=400, detail="Only .env files are allowed")

    try:
        content_a = (await env_a.read()).decode("utf-8")
        content_b = (await env_b.read()).decode("utf-8")
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="Invalid file encoding")

    result = compare_envs(content_a, content_b, SCHEMA_PATH)
    return JSONResponse(content=result)
