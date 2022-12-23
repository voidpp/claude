from datetime import timedelta

from graphene import List

from claude.components.graphene.node_base import NodeBase, NodeConfig
from claude.components.graphene.pydantic import object_type_from_pydantic
from claude.components.weather.plugin import WeatherProvider
from claude.components.weather.types import DayForecast

from .types import WeatherNodeValidator


class DaysForecastWeatherNode(NodeBase[WeatherNodeValidator]):
    config = NodeConfig(
        result_type=List(object_type_from_pydantic(DayForecast)),
        input_validator=WeatherNodeValidator,
        cache_expiry_time=timedelta(hours=3),
    )

    async def resolve(self):
        provider: WeatherProvider = await self.load_plugin(self.args.provider_id)
        return await provider.get_days(self.args.city)
