# backend/app/core/schema.py

import yaml
from pathlib import Path


class SchemaLoadError(Exception):
    pass


def load_schema(path: str) -> dict:
    schema_path = Path(path)

    if not schema_path.exists():
        raise SchemaLoadError(f"Schema not found: {path}")

    with open(schema_path, "r", encoding="utf-8") as f:
        try:
            data = yaml.safe_load(f)
        except yaml.YAMLError as e:
            raise SchemaLoadError(f"Invalid YAML schema: {e}")

    if "variables" not in data:
        raise SchemaLoadError("Schema must define 'variables'")

    return data
