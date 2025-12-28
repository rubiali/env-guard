# app/main.py

from pathlib import Path
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.routers import ui, api

BASE_DIR = Path(__file__).resolve().parent

app = FastAPI(
    title="Env-Guard",
    description="Validate and compare .env files using a fixed schema",
    version="0.1.0",
)

# Monta arquivos estáticos (CSS, JS, imagens)
app.mount(
    "/static",
    StaticFiles(directory=BASE_DIR / "static"),
    name="static",
)

app.include_router(ui.router)
app.include_router(api.router)
