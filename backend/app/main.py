# backend/app/main.py

from fastapi import FastAPI



app = FastAPI(
    title="Env-Guard",
    description="Validate .env files against a fixed schema",
    version="0.1.0"
)