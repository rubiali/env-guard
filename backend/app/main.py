from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse, HTMLResponse
from pathlib import Path

from app.core.validator import validate_env
from app.core.diff import compare_envs
from app.core.parser import EnvParseError
from app.core.schema import SchemaLoadError

SCHEMA_PATH = "app/schemas/schema.yaml"

# caminho absoluto para frontend/
FRONTEND_DIR = Path(__file__).resolve().parents[2] / "frontend"

app = FastAPI(
    title="Env-Guard",
    description="Validate and compare .env files using a fixed schema",
    version="0.1.0"
)

# --------------------
# UI ROUTES
# --------------------

@app.get("/", response_class=HTMLResponse)
def index():
    return (FRONTEND_DIR / "index.html").read_text(encoding="utf-8")


@app.get("/ui/validate", response_class=HTMLResponse)
def ui_validate():
    return (FRONTEND_DIR / "validate.html").read_text(encoding="utf-8")


@app.get("/ui/compare", response_class=HTMLResponse)
def ui_compare():
    return (FRONTEND_DIR / "compare.html").read_text(encoding="utf-8")


# --------------------
# API ROUTES
# --------------------

def _is_env_file(filename: str) -> bool:
    # aceita .env, .env.dev, .env.prod, etc
    return ".env" in filename


@app.post("/validate")
async def validate_env_file(file: UploadFile = File(...)):
    if not _is_env_file(file.filename):
        raise HTTPException(status_code=400, detail="Invalid env file name")

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


@app.post("/compare")
async def compare_env_files(
    env_a: UploadFile = File(...),
    env_b: UploadFile = File(...)
):
    for f in (env_a, env_b):
        if not _is_env_file(f.filename):
            raise HTTPException(status_code=400, detail="Invalid env file name")

    try:
        content_a = (await env_a.read()).decode("utf-8")
        content_b = (await env_b.read()).decode("utf-8")
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="Invalid file encoding")

    result = compare_envs(content_a, content_b, SCHEMA_PATH)
    return JSONResponse(content=result)
