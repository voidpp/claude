from enum import Enum
from uuid import UUID

from pydantic import BaseModel


class Widget(BaseModel):
    id: UUID
    dashboard_id: UUID
    type: str
    x: int
    y: int
    width: int
    height: int
    settings: dict


class Dashboard(BaseModel):
    id: UUID
    name: str
    step_size: int
    background: str
    theme: str
    locale: str


class PluginType(Enum):
    WEATHER = "weather"


class Plugin(BaseModel):
    id: UUID
    title: str
    type: PluginType
    class_name: str


class Settings(BaseModel):
    dashboards: list[Dashboard]
    widgets: list[Widget]
    plugins: list[Plugin]
