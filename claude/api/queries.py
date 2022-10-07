from graphene import Field, ObjectType, ResolveInfo, String

from claude.api.nodes.server_status import ServerStatusNode
from claude.components.graphene.tools import create_nested_field

from .nodes.weather.current import CurrentWeatherNode
from .nodes.weather.days import DaysForecastWeatherNode
from .nodes.weather.hours import HoursForecastWeatherNode


async def ping(root, info: ResolveInfo):
    return "pong"


class Weather(ObjectType):
    current = CurrentWeatherNode.field()
    days = DaysForecastWeatherNode.field()
    hours = HoursForecastWeatherNode.field()


class Query(ObjectType):
    ping = Field(String, resolver=ping)

    weather = create_nested_field(Weather)
    server_status = ServerStatusNode.field()
