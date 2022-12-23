import os
from pathlib import Path

import yaml
from pydantic import BaseModel, FilePath

from claude.components.types import Environment


class Config(BaseModel):
    redis: str
    plugins_folder: str


def load_config() -> Config:
    filename = Environment.CONFIG_FILE.get()

    if filename is None:
        raise Exception(f"Set {Environment.CONFIG_FILE} for config file")

    file = Path(filename)

    if not file.is_file:
        raise Exception(f"Config file {file} from env:{Environment.CONFIG_FILE} is not exists or not a file")

    data = yaml.safe_load(file.read_text())

    if data is None:
        raise Exception(f"Config file {file}")

    return Config(**data)
