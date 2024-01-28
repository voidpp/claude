from pathlib import Path

import yaml
from pydantic import BaseModel

from claude.env import env_key, environment


class Config(BaseModel):
    redis: str
    plugins_folder: str


def load_config() -> Config:
    env = environment()
    filename = env.config_file

    if filename is None:
        raise Exception(f"Set {env_key('config_file')} for config file")

    file = Path(filename)

    if not file.is_file:
        raise Exception(f"Config file {file} from env:{env_key('config_file')} is not exists or not a file")

    data = yaml.safe_load(file.read_text())

    if data is None:
        raise Exception(f"Config file {file}")

    return Config(**data)
