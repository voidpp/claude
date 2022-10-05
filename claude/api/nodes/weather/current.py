from datetime import timedelta
from pydantic import BaseModel

from claude.components.graphene.node_base import NodeBase
from claude.components.graphene.pydantic import object_type_from_pydantic
from claude.components.weather.idokep.parsers import get_current
from claude.components.weather.types import CurrentWeather


class CurrentWeatherNodeValidator(BaseModel):
    city: str


class CurrentWeatherNode(NodeBase[CurrentWeatherNodeValidator]):
    result_type = object_type_from_pydantic(CurrentWeather)
    input_validator = CurrentWeatherNodeValidator
    cache_expiry_time = timedelta(minutes=10)

    async def resolve(self):
        return await get_current(self.args.city, self.request_context.config.idokep_parser.current)
