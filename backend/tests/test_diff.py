from app.core.diff import compare_envs
from pathlib import Path

FIXTURES = Path(__file__).parent / "fixtures"


def test_compare_dev_and_prod():
    env_dev = (FIXTURES / "env.dev").read_text()
    env_prod = (FIXTURES / "env.prod").read_text()

    result = compare_envs(env_dev, env_prod, schema_name="generic")

    assert "DEBUG" in result["different_values"]
    assert "DATABASE_URL" in result["different_values"]
    assert result["only_in_a"] == []
    assert result["only_in_b"] == []
