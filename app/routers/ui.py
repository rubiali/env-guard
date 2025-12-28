# app/routers/ui.py

from pathlib import Path
from fastapi import APIRouter
from fastapi.responses import HTMLResponse

router = APIRouter()

TEMPLATES_DIR = Path(__file__).resolve().parent.parent / "templates"


def _read_html(filename: str) -> str:
    return (TEMPLATES_DIR / filename).read_text(encoding="utf-8")


@router.get("/", response_class=HTMLResponse)
def index():
    return _read_html("index.html")


@router.get("/ui/validate", response_class=HTMLResponse)
def ui_validate():
    return _read_html("validate.html")


@router.get("/ui/compare", response_class=HTMLResponse)
def ui_compare():
    return _read_html("compare.html")
