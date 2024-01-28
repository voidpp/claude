from graphene import Field, ObjectType, ResolveInfo, String
from starlette.requests import Request

from claude.api.nodes.cache import RequestCacheNode
from claude.api.nodes.server_status import ServerStatusNode
from claude.api.nodes.settings import SettingsNode
from claude.api.nodes.sunset_sunrise import SunriseSunsetNode
from claude.components.graphene.tools import create_nested_field
from claude.components.tools import app_version
from .nodes.plugin_data import PluginDataNode

from .nodes.weather.current import CurrentWeatherNode
from .nodes.weather.days import DaysForecastWeatherNode
from .nodes.weather.hours import HoursForecastWeatherNode


async def ping(root, info: ResolveInfo):
    return "pong"


async def version(root, info: ResolveInfo):
    request: Request = info.context["request"]
    return app_version(request.app.debug)


class Weather(ObjectType):
    current = CurrentWeatherNode.field()
    days = DaysForecastWeatherNode.field()
    hours = HoursForecastWeatherNode.field()


class Query(ObjectType):
    ping = Field(String, resolver=ping)

    weather = create_nested_field(Weather)
    server_status = ServerStatusNode.field()
    settings = SettingsNode.field()
    sunrise_sunset = SunriseSunsetNode.field()

    version = Field(String, resolver=version)

    request_cache = RequestCacheNode.field()

    plugin_data = PluginDataNode.field()
