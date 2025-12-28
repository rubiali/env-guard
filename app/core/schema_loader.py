# app/core/schema_loader.py

from pathlib import Path
import yaml

SCHEMAS_DIR = Path(__file__).resolve().parent.parent / "schemas"

# Metadados dos schemas (adicione/edite conforme seus schemas)
SCHEMA_META = {
    "generic": {
        "name": "Generic",
        "description": "Basic environment variables for any project",
        "icon": "bi-file-earmark-code",
        "color": "#6366f1",
    },
    "flask": {
        "name": "Flask",
        "description": "Common variables for Flask applications",
        "icon": "bi-cup-hot",
        "color": "#10b981",
    },
    "fastapi": {
        "name": "FastAPI",
        "description": "Environment setup for FastAPI projects",
        "icon": "bi-lightning-charge",
        "color": "#059669",
    },
    "django": {
        "name": "Django",
        "description": "Django framework environment variables",
        "icon": "bi-grid-3x3",
        "color": "#0d9488",
    },
    "node": {
        "name": "Node.js",
        "description": "Standard Node.js backend configuration",
        "icon": "bi-hexagon",
        "color": "#84cc16",
    },
    "dockerfile": {
        "name": "Dockerfile",
        "description": "Environment variables for Docker containers",
        "icon": "bi-box-seam",
        "color": "#2496ed",
    },
}


def list_schemas() -> list[dict]:
    """Lista todos os schemas com metadados."""
    schemas = []
    for schema_id, meta in SCHEMA_META.items():
        schema_file = SCHEMAS_DIR / f"{schema_id}.yaml"
        if schema_file.exists():
            schema_data = load_schema(schema_id)
            var_count = len(schema_data.get("variables", {}))
            required_count = sum(
                1 for v in schema_data.get("variables", {}).values()
                if v.get("required", False)
            )
            schemas.append({
                "id": schema_id,
                **meta,
                "variables": var_count,
                "required": required_count,
            })
    return schemas


def load_schema(schema_name: str) -> dict:
    """Carrega um schema pelo nome."""
    schema_file = SCHEMAS_DIR / f"{schema_name}.yaml"
    if not schema_file.exists():
        raise FileNotFoundError(f"Schema '{schema_name}' not found")
    
    with open(schema_file, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)
