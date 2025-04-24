from datetime import date
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
    name: str
    type: PluginType
    class_name: str


class SpecialDayType(Enum):
    NON_WORKING_DAY = "non_working_day"
    RELOCATED_REST_DAY = "relocated_rest_day"
    RELOCATED_WORKING_DAY = "relocated_working_day"


class SpecialDayId(BaseModel):
    date: date
    locale: str


class SpecialDay(SpecialDayId):
    type: SpecialDayType


def get_special_day_id(data: SpecialDayId):
    return data.date.isoformat() + data.locale


class FreeCurrencyAPIAccount(BaseModel):
    id: UUID
    name: str
    api_key: str


class HomeAssitantServer(BaseModel):
    enabled: bool
    url: str
    api_token: str


class Settings(BaseModel):
    dashboards: list[Dashboard] = None
    widgets: list[Widget] = None
    plugins: list[Plugin] = None
    special_days: list[SpecialDay] = None
    free_currency_api_accounts: list[FreeCurrencyAPIAccount] = None
    home_assistant_server: HomeAssitantServer | None = None


class PluginData(BaseModel):
    metadata: Plugin
    content: str
