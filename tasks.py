import os
from pathlib import Path
from invoke import task
from claude.components.types import EnvironmentKeys


@task
def start(c, port=9042, reload=True):
    cmd_parts = [
        "uvicorn",
        "claude.app:get_app",
        "--factory",
        "--host 0.0.0.0",
        f"--port {port}",
    ]

    if reload:
        cmd_parts.append("--reload")
        if config_file := os.environ.get(EnvironmentKeys.CONFIG_FILE):
            rel_path = Path(config_file).relative_to(Path(__file__).parent)
            cmd_parts += ["--reload-include", str(rel_path)]

    c.run(" ".join(cmd_parts))
