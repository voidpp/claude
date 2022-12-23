from datetime import timedelta

from claude.components.graphene.node_base import NodeBase, NodeConfig
from claude.components.graphene.pydantic import object_type_from_pydantic
from claude.components.weather.plugin import WeatherProvider
from claude.components.weather.types import CurrentWeather

from .types import WeatherNodeValidator


class CurrentWeatherNode(NodeBase[WeatherNodeValidator]):
    config = NodeConfig(
        result_type=object_type_from_pydantic(CurrentWeather),
        input_validator=WeatherNodeValidator,
        cache_expiry_time=timedelta(minutes=10),
    )

    async def resolve(self):
        provider: WeatherProvider = await self.load_plugin(self.args.provider_id)
        return await provider.get_current(self.args.city)
