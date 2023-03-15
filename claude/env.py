import os
from typing import Literal, TypeAlias

from pydantic import BaseModel, Field


class EnvironmentSchema(BaseModel):
    config_file: str = Field()
    dev_mode: bool = False


def environment() -> EnvironmentSchema:
    data = {}
    for name, field in EnvironmentSchema.__fields__.items():
        env_key_name = env_key(name)
        data[name] = os.environ.get(env_key_name, field.default)

    return EnvironmentSchema(**data)


def env_key(name: str) -> str:
    assert name in EnvironmentSchema.__fields__
    return f"claude_{name}".upper()
