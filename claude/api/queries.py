from graphene import Field, ObjectType, ResolveInfo, String

from claude.api.nodes.weather.current import CurrentWeatherNode
from claude.api.nodes.weather.days import DaysForecastWeatherNode
from claude.api.nodes.weather.hours import HoursForecastWeatherNode
from claude.components.graphene.tools import create_nested_field


async def ping(root, info: ResolveInfo):
    return "pong"


class Weather(ObjectType):
    current = CurrentWeatherNode.field()
    days = DaysForecastWeatherNode.field()
    hours = HoursForecastWeatherNode.field()


class Query(ObjectType):
    ping = Field(String, resolver=ping)

    weather = create_nested_field(Weather)
