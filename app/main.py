# app/main.py

from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import JSONResponse
from app.core.parser import EnvParseError

from app.routers import ui, api

BASE_DIR = Path(__file__).resolve().parent

app = FastAPI(
    title="Env-Guard",
    description="Validate and compare .env files using a fixed schema",
    version="0.1.0",
)

app.mount(
    "/static",
    StaticFiles(directory=BASE_DIR / "static"),
    name="static",
)

# Configura Jinja2
templates = Jinja2Templates(directory=BASE_DIR / "templates")

# Injeta templates no router de UI
ui.templates = templates

app.include_router(ui.router)
app.include_router(api.router)

@app.exception_handler(EnvParseError)
async def env_parse_exception_handler(request: Request, exc: EnvParseError):
    return JSONResponse(
        status_code=400,
        content={"error": str(exc)}
    )