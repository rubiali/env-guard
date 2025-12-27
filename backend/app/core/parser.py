# backend/app/core/parser.py

class EnvParseError(Exception):
    pass


def parse_env(content: str) -> dict[str, str]:
    env = {}
    lines = content.splitlines()

    for idx, line in enumerate(lines, start=1):
        line = line.strip()

        if not line or line.startswith("#"):
            continue

        if "=" not in line:
            raise EnvParseError(f"Invalid line {idx}: missing '='")

        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip()

        if not key:
            raise EnvParseError(f"Invalid line {idx}: empty key")

        if key in env:
            raise EnvParseError(f"Duplicate key '{key}' at line {idx}")

        env[key] = value

    return env
