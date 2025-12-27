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


