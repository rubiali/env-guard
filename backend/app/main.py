from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse, HTMLResponse
from pathlib import Path

from app.core.validator import validate_env
from app.core.diff import compare_envs
from fastapi import Query
from fastapi.staticfiles import StaticFiles

SCHEMA_PATH = "app/schemas/schema.yaml"

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = BASE_DIR.parent / "frontend"

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

def _is_env_file(filename: str) -> bool:
    return True


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
