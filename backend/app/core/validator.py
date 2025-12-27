# backend/app/core/validator.py

from .parser import parse_env
from .schema import load_schema


class ValidationError(Exception):
    pass


def cast_value(value: str, expected_type: str):
    if expected_type == "string":
        return value

    if expected_type == "int":
        try:
            return int(value)
        except ValueError:
            raise ValidationError(f"Expected int, got '{value}'")

    if expected_type == "bool":
        v = value.lower()
        if v in ("true", "1", "yes"):
            return True
        if v in ("false", "0", "no"):
            return False
        raise ValidationError(f"Expected bool, got '{value}'")

    raise ValidationError(f"Unknown type '{expected_type}'")


def validate_env(env_content: str, schema_path: str) -> dict:
    env = parse_env(env_content)
    schema = load_schema(schema_path)["variables"]

    missing = []
    invalid = []
    validated = {}

    for key, rules in schema.items():
        if rules.get("required") and key not in env:
            missing.append(key)
            continue

        if key in env:
            try:
                value = cast_value(env[key], rules["type"])

                if "min" in rules and value < rules["min"]:
                    raise ValidationError(f"Value < min ({rules['min']})")

                if "max" in rules and value > rules["max"]:
                    raise ValidationError(f"Value > max ({rules['max']})")

                validated[key] = value
            except ValidationError as e:
                invalid.append({
                    "key": key,
                    "reason": str(e)
                })

    extra = [k for k in env.keys() if k not in schema]

    return {
        "missing": missing,
        "invalid": invalid,
        "extra": extra,
        "validated": validated
    }
