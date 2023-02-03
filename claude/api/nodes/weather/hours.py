from datetime import timedelta

from graphene import List

from claude.components.graphene.node_base import NodeBase, NodeConfig
from claude.components.graphene.pydantic import object_type_from_pydantic
from claude.components.weather.plugin import WeatherProvider
from claude.components.weather.types import HourForecast

from .types import WeatherNodeValidator


class HoursForecastWeatherNode(NodeBase[WeatherNodeValidator]):
    config = NodeConfig(
        result_type=List(object_type_from_pydantic(HourForecast)),
        input_validator=WeatherNodeValidator,
        cache_expiry_time=timedelta(minutes=10),
    )

    async def resolve(self):
        provider: WeatherProvider = await self.load_plugin(self.args.provider_id)
        return await provider.get_hours(self.args.city)
