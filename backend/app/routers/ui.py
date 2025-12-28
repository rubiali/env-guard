# backend/app/routers/ui.py

from fastapi import APIRouter
from fastapi.responses import HTMLResponse
from pathlib import Path

router = APIRouter()

FRONTEND_DIR: Path | None = None


def _read_html(filename: str) -> str:
    assert FRONTEND_DIR is not None, "FRONTEND_DIR não foi configurado"
    return (FRONTEND_DIR / filename).read_text(encoding="utf-8")


@router.get("/", response_class=HTMLResponse)
def index():
    return _read_html("index.html")


@router.get("/ui/validate", response_class=HTMLResponse)
def ui_validate():
    return _read_html("validate.html")


@router.get("/ui/compare", response_class=HTMLResponse)
def ui_compare():
    return _read_html("compare.html")
