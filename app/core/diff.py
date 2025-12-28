from .validator import validate_env


def compare_envs(env_a: str, env_b: str, schema_name: str = "generic") -> dict:
    result_a = validate_env(env_a, schema_name=schema_name)
    result_b = validate_env(env_b, schema_name=schema_name)

    values_a = result_a["validated"]
    values_b = result_b["validated"]

    only_in_a = [k for k in values_a if k not in values_b]
    only_in_b = [k for k in values_b if k not in values_a]

    different_values = [
        k for k in values_a
        if k in values_b and values_a[k] != values_b[k]
    ]

    return {
        "only_in_a": only_in_a,
        "only_in_b": only_in_b,
        "different_values": different_values,
        "validation": {
            "a": result_a,
            "b": result_b
        }
    }
