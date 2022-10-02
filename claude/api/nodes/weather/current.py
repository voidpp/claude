from graphene import ObjectType, Field, Float, String
from pydantic import BaseModel

from claude.components.graphene.node_base import NodeBase
from claude.components.graphene.pydantic import object_type_from_pydantic
from claude.components.weather.types import CurrentWeather


class CurrentWeatherNodeValidator(BaseModel):
    city: str


class CurrentWeatherNode(NodeBase[CurrentWeatherNodeValidator]):
    result_type = object_type_from_pydantic(CurrentWeather)
    input_validator = CurrentWeatherNodeValidator

    async def resolve(self):
        # weather_data = await self.request_context.weather_provider.get_current_weather(self.args.city)
        return {"image": "", "temperature": 0}
