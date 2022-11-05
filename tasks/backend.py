import os
from pathlib import Path

from invoke import task

from claude.components.folders import Folders
from claude.components.types import Environment


@task
def start(c, port=9042, reload=True, workers=None, debug=True):
    cmd_parts = [
        "uvicorn",
        "claude.app:get_app",
        "--factory",
        "--host 0.0.0.0",
        f"--port {port}",
    ]

    if reload:
        cmd_parts.append("--reload")
        if config_file := Environment.CONFIG_FILE.get():
            rel_path = Path(config_file).relative_to(Path(__file__).parent.parent)
            cmd_parts += ["--reload-include", str(rel_path)]
    elif workers:
        cmd_parts.append(f"--workers {workers}")

    if debug:
        Environment.DEV_MODE.set("1")

    c.run(" ".join(cmd_parts))


@task
def test(c, watch=False):
    c.run("ptw" if watch else "pytest")


@task
def format(c):
    c.run("pre-commit run --all-files --verbose")


@task
def generate_graphql_schema(c):
    from claude.api.schema import create_api_schema

    path = Folders.frontend / "schema.graphql"
    path.write_text(str(create_api_schema()))
    print(f"{path.relative_to(Folders.project_root)} has been written!")
