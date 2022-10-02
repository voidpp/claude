from pydantic import BaseModel

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
    pass
