from app.core.validator import validate_env


def test_validation_detects_missing_and_invalid():
    env = "DEBUG=true\nPORT=80"
    result = validate_env(env, schema_name="generic")

    assert "DATABASE_URL" in result["missing"]
    assert any(i["key"] == "PORT" for i in result["invalid"])


def test_extra_variables_are_detected():
    env = "DEBUG=true\nPORT=8000\nDATABASE_URL=db\nFOO=bar"
    result = validate_env(env, schema_name="generic")

    assert "FOO" in result["extra"]
