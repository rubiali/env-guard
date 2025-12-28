# backend/app/utils/paths.py

from pathlib import Path


def resolve_frontend_dir() -> Path:
    """
    Resolve o diretório do frontend independente do ambiente.
    Funciona tanto em Docker quanto em desenvolvimento local.
    """
    base = Path(__file__).resolve().parent.parent  # app/

    # Docker ou monorepo flat
    docker_path = base.parent / "frontend"
    if docker_path.is_dir():
        return docker_path

    # Desenvolvimento local (backend/ e frontend/ são irmãos)
    local_path = base.parent.parent / "frontend"
    if local_path.is_dir():
        return local_path

    raise RuntimeError(
        f"Frontend não encontrado. Tentei:\n"
        f"  - {docker_path}\n"
        f"  - {local_path}"
    )
