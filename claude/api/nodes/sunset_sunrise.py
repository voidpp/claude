import json
import logging
import urllib.parse
from ast import arg
from datetime import timedelta

from pydantic import BaseModel

from claude.components.fetcher import Fetcher
from claude.components.graphene.node_base import NodeBase, NodeConfig
from claude.components.graphene.pydantic import object_type_from_pydantic

logger = logging.getLogger(__name__)


class SunriseSunsetNodeValidator(BaseModel):
    city: str


class SunriseSunset(BaseModel):
    sunrise: str
    sunset: str
    solar_noon: str
    day_length: int
    civil_twilight_begin: str
    civil_twilight_end: str
    nautical_twilight_begin: str
    nautical_twilight_end: str
    astronomical_twilight_begin: str
    astronomical_twilight_end: str


class Coordinates(BaseModel):
    long: str
    lat: str


class CoordinatesFetchingError(Exception):
    pass


class SunriseSunsetNode(NodeBase[SunriseSunsetNodeValidator]):
    config = NodeConfig(
        result_type=object_type_from_pydantic(SunriseSunset),
        input_validator=SunriseSunsetNodeValidator,
        cache_expiry_time=timedelta(hours=12),
    )

    async def get_coordinates(self) -> Coordinates:
        key = "city_coordinate_" + self.args.city

        if data := await self.request_context.redis.get(key):
            return Coordinates(**json.loads(data.decode()))

        city = urllib.parse.quote(self.args.city)
        logger.debug("Fetching coordinates geocode.xyz for city: %s", self.args.city)
        geocode_data = await Fetcher.fetch_json(f"https://geocode.xyz/{city}?json=1")

        if error := geocode_data.get("error"):
            raise CoordinatesFetchingError(error["description"])

        data = Coordinates(long=geocode_data["longt"], lat=geocode_data["latt"])

        await self.request_context.redis.set(key, json.dumps(data.dict()))
        return data

    async def resolve(self):
        try:
            coordinates = await self.get_coordinates()
        except CoordinatesFetchingError as e:
            # TODO: proper error message to the user
            logger.error(e)
            return None

        url = f"https://api.sunrise-sunset.org/json?lat={coordinates.lat}&lng={coordinates.long}&formatted=0"
        api_data = await Fetcher.fetch_json(url)

        return api_data["results"]
