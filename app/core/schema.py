# backend/app/core/schema.py

import yaml
from pathlib import Path


class SchemaLoadError(Exception):
    pass


SCHEMAS_DIR = Path(__file__).resolve().parents[1] / "schemas"


def load_schema_by_name(name: str) -> dict:
    schema_path = SCHEMAS_DIR / f"{name}.yaml"

    if not schema_path.exists():
        raise SchemaLoadError(f"Schema '{name}' not found")

    return _load_yaml(schema_path)


def load_schema_from_file(content: str) -> dict:
    try:
        data = yaml.safe_load(content)
    except yaml.YAMLError as e:
        raise SchemaLoadError(f"Invalid YAML schema: {e}")

    if "variables" not in data:
        raise SchemaLoadError("Schema must define 'variables'")

    return data


def _load_yaml(path: Path) -> dict:
    with open(path, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f)

    if "variables" not in data:
        raise SchemaLoadError("Schema must define 'variables'")

    return data
