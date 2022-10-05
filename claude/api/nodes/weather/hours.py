from datetime import timedelta
from graphene import List
from pydantic import BaseModel

from claude.components.graphene.node_base import NodeBase
from claude.components.graphene.pydantic import object_type_from_pydantic
from claude.components.weather.idokep.parsers import get_hours
from claude.components.weather.types import HourForecast


class HoursForecastNodeValidator(BaseModel):
    city: str


class HoursForecastWeatherNode(NodeBase[HoursForecastNodeValidator]):
    result_type = List(object_type_from_pydantic(HourForecast))
    input_validator = HoursForecastNodeValidator
    cache_expiry_time = timedelta(minutes=30)

    async def resolve(self):
        return await get_hours(self.args.city, self.request_context.config.idokep_parser.hours)
