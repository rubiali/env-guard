# backend/app/main.py

from fastapi import FastAPI, UploadFile, File, Query
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from app.core.validator import validate_env
from app.core.diff import compare_envs


def _resolve_frontend_dir() -> Path:
    """
    Resolve o diretório do frontend independente do ambiente.
    Funciona tanto em Docker quanto em desenvolvimento local.
    """
    base = Path(__file__).resolve().parent  # .../app/
    
    # Caminho 1: Docker ou monorepo flat (/app/frontend)
    docker_path = base.parent / "frontend"
    if docker_path.is_dir():
        return docker_path
    
    # Caminho 2: Desenvolvimento local (backend/ e frontend/ são irmãos)
    local_path = base.parent.parent / "frontend"
    if local_path.is_dir():
        return local_path
    
    raise RuntimeError(
        f"Frontend não encontrado. Tentei:\n"
        f"  - {docker_path}\n"
        f"  - {local_path}"
    )


FRONTEND_DIR = _resolve_frontend_dir()

app = FastAPI(
    title="Env-Guard",
    description="Validate and compare .env files using a fixed schema",
    version="0.1.0"
)

app.mount(
    "/static",
    StaticFiles(directory=FRONTEND_DIR / "static"),
    name="static"
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

@app.post("/validate")
async def validate_env_file(
    file: UploadFile = File(...),
    schema: str = Query(default="generic"),
    schema_file: UploadFile | None = File(default=None)
):
    content = (await file.read()).decode("utf-8")

    schema_content = None
    if schema_file:
        schema_content = (await schema_file.read()).decode("utf-8")

    result = validate_env(
        content,
        schema_name=schema,
        custom_schema_content=schema_content
    )
    return JSONResponse(content=result)


@app.post("/compare")
async def compare_env_files(
    env_a: UploadFile = File(...),
    env_b: UploadFile = File(...),
    schema: str = Query(default="generic")
):
    content_a = (await env_a.read()).decode("utf-8")
    content_b = (await env_b.read()).decode("utf-8")

    result = compare_envs(
        content_a,
        content_b,
        schema_name=schema
    )
    return JSONResponse(content=result)
