from app.core.parser import parse_env, EnvParseError
import pytest


def test_parse_basic_env():
    content = "DEBUG=true\nPORT=8000"
    result = parse_env(content)

    assert result["DEBUG"] == "true"
    assert result["PORT"] == "8000"


def test_ignore_comments_and_blank_lines():
    content = "# comment\n\nDEBUG=true"
    result = parse_env(content)

    assert "DEBUG" in result
    assert len(result) == 1


def test_duplicate_key_raises_error():
    content = "DEBUG=true\nDEBUG=false"

    with pytest.raises(EnvParseError):
        parse_env(content)
