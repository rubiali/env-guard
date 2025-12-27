from app.core.diff import compare_envs

SCHEMA_PATH = "app/schemas/schema.yaml"


def test_compare_envs_detects_differences():
    env_a = "DEBUG=true\nPORT=8000\nDATABASE_URL=postgres://dev"
    env_b = "DEBUG=false\nPORT=8000\nDATABASE_URL=postgres://prod"

    result = compare_envs(env_a, env_b, SCHEMA_PATH)

    assert "DEBUG" in result["different_values"]
    assert "DATABASE_URL" in result["different_values"]
    assert result["only_in_a"] == []
    assert result["only_in_b"] == []
