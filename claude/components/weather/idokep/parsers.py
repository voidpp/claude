import logging
from datetime import date, timedelta
from urllib.parse import quote

from claude.components.exceptions import SelectorNotFoundInTree
from claude.components.fetcher import Fetcher
from claude.components.tools import parse_number, tree_search, tree_search_list

from ..types import CurrentWeather, DayForecast, HourForecast
from .config import (
    IdokepCurrentParserConfig,
    IdokepDaysParserConfig,
    IdokepHoursParserConfig,
)

logger = logging.getLogger(__name__)

base_url = "https://www.idokep.hu"


async def get_current(city: str, config: IdokepCurrentParserConfig) -> CurrentWeather:
    tree = await Fetcher.fetch_xml(f"{base_url}/idojaras/{quote(city)}")

    current_container = tree_search(config.container, tree)

    return CurrentWeather(
        image=base_url + tree_search(config.image, current_container).attrib["src"],
        temperature=parse_number(tree_search(config.temperature, current_container).text),
    )


async def get_days(city: str, config: IdokepDaysParserConfig) -> list[DayForecast]:
    tree = await Fetcher.fetch_xml(f"{base_url}/elorejelzes/{quote(city)}")

    day_columns = tree_search_list(config.columns, tree)

    res = []

    col_date = None

    for day_column in day_columns:
        day_cell = tree_search(config.cell, day_column)
        if day_cell is None:
            continue

        precipitation_val = 0

        if rainlevel_container := tree_search_list(config.rainlevel, day_column, fail_on_not_found=False):
            precipitation_text = rainlevel_container[0].text
            if precipitation_text != ".":
                precipitation_val = parse_number(precipitation_text)

        day = int(day_cell.text)

        [max, min] = [parse_number(element.text) for element in tree_search_list(config.temperature, day_column)]

        if col_date is None:
            col_date = date.today()
            while col_date.day != day:
                col_date = col_date + timedelta(days=1)

        day_data = {
            "image": base_url + tree_search(config.image, day_column).attrib["src"],
            "day": day,
            "date": str(col_date),
            "temperature": {
                "min": min,
                "max": max,
            },
            "precipitation": {
                "value": precipitation_val,
                "probability": None,
            },
        }
        res.append(DayForecast(**day_data))

        col_date = col_date + timedelta(days=1)

    return res


async def get_hours(city: str, config: IdokepHoursParserConfig) -> list[HourForecast]:
    tree = await Fetcher.fetch_xml(f"{base_url}/elorejelzes/{quote(city)}")

    hour_columns = tree_search_list(config.columns, tree)

    res = []

    for hour_column in hour_columns:

        precipitation_val = 0
        precipitation_prob = 0

        try:
            rain_chance = tree_search(config.rain_chance_prob, hour_column)
            precipitation_prob = parse_number(rain_chance.text)
        except SelectorNotFoundInTree:
            pass

        # TODO: wind

        hour_data = {
            "hour": int(tree_search(config.hour, hour_column).text.split(":")[0]),
            "image": base_url + tree_search(config.image, hour_column).attrib["src"],
            "temperature": parse_number(tree_search(config.temperature, hour_column).text),
            "precipitation": {
                "value": precipitation_val,
                "probability": precipitation_prob,
            },
        }

        res.append(HourForecast(**hour_data))

    return res
