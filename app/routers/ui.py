# app/routers/ui.py

from fastapi import APIRouter, Request
from fastapi.templating import Jinja2Templates

router = APIRouter()

templates: Jinja2Templates = None  # injetado pelo main.py


@router.get("/")
def index(request: Request):
    return templates.TemplateResponse(
        "index.html",
        {"request": request}
    )


@router.get("/ui/validate")
def ui_validate(request: Request):
    return templates.TemplateResponse(
        "validate.html",
        {"request": request, "page_title": "Validate"}
    )


@router.get("/ui/compare")
def ui_compare(request: Request):
    return templates.TemplateResponse(
        "compare.html",
        {"request": request, "page_title": "Compare"}
    )
