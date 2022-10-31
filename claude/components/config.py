import os
from pathlib import Path

import yaml
from pydantic import BaseModel, FilePath

from claude.components.types import EnvironmentKeys
from claude.components.weather.idokep.config import (
    IdokepCurrentParserConfig,
    IdokepDaysParserConfig,
    IdokepHoursParserConfig,
)


class IdokepParserConfig(BaseModel):
    hours: IdokepHoursParserConfig
    days: IdokepDaysParserConfig
    current: IdokepCurrentParserConfig


class Config(BaseModel):
    redis: str
    idokep_parser: IdokepParserConfig


def load_config() -> Config:
    filename = os.environ.get(EnvironmentKeys.CONFIG_FILE)

    if filename is None:
        raise Exception(f"Set {EnvironmentKeys.CONFIG_FILE} for config file")

    file = Path(filename)

    if not file.is_file:
        raise Exception(f"Config file {file} from env:{EnvironmentKeys.CONFIG_FILE} is not exists or not a file")

    data = yaml.safe_load(file.read_text())

    if data is None:
        raise Exception(f"Config file {file}")

    return Config(**data)
