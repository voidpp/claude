from datetime import date, timedelta
import logging
from urllib.parse import quote

from claude.components.tools import fetch_xml, parse_temp, tree_search
from .config import IdokepCurrentParserConfig, IdokepDaysParserConfig
from ..types import CurrentWeather, DayForecast

logger = logging.getLogger(__name__)

base_url = "https://www.idokep.hu"


async def get_current(city: str, config: IdokepCurrentParserConfig) -> CurrentWeather:
    tree = await fetch_xml(f"{base_url}/idojaras/{quote(city)}")

    current_container = tree_search(config.container, tree)

    return CurrentWeather(
        image=base_url + tree_search(config.image, current_container).attrib["src"],
        temperature=parse_temp(tree_search(config.temperature, current_container).text),
    )


async def get_days(city: str, config: IdokepDaysParserConfig) -> list[DayForecast]:
    tree = await fetch_xml(f"{base_url}/elorejelzes/{quote(city)}")

    day_columns = tree_search(config.columns, tree, return_first=False)

    res = []

    col_date = None

    for day_column in day_columns:
        day_cell = tree_search(config.cell, day_column)
        if day_cell is None:
            continue

        # TODO: implement
        precipitation_val = 0
        precipitation_probability = 0

        day = int(day_cell.text)

        if col_date is None:
            col_date = date.today()
            while col_date.day != day:
                col_date = col_date + timedelta(days=1)

        day_data = {
            "image": base_url + tree_search(config.image, day_column).attrib["src"],
            "day": day,
            "date": str(col_date),
            "temperature": {
                "min": parse_temp(tree_search(config.temperature.min, day_column).text),
                "max": parse_temp(tree_search(config.temperature.max, day_column).text),
            },
        }
        res.append(DayForecast(**day_data))

        col_date = col_date + timedelta(days=1)

    return res
