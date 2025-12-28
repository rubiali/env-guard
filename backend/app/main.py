# backend/app/main.py

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.routers import ui, api
from app.utils.paths import resolve_frontend_dir

frontend_dir = resolve_frontend_dir()

# injeta no módulo de UI
ui.FRONTEND_DIR = frontend_dir

app = FastAPI(
    title="Env-Guard",
    description="Validate and compare .env files using a fixed schema",
    version="0.1.0",
)

app.mount(
    "/static",
    StaticFiles(directory=frontend_dir / "static"),
    name="static",
)

app.include_router(ui.router)
app.include_router(api.router)
