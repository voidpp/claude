import pytest
from claude.components.weather.idokep.config import IdokepCurrentParserConfig, IdokepDaysParserConfig

from claude.components.weather.idokep.parsers import get_current, get_days


@pytest.mark.asyncio
async def test_current():
    config = IdokepCurrentParserConfig(
        container=".current-weather-lockup",
        image=".current-weather-icon > img",
        temperature=".current-temperature",
    )
    print(await get_current("Budapest", config))
    assert 0


@pytest.mark.asyncio
async def test_days():
    config = IdokepDaysParserConfig(
        columns=".dailyForecastCol",
        cell=".dfColHeader .dfDayNum",
        image=".forecast-icon",
        temperature={
            "min": ".min a",
            "max": ".max a",
        },
    )
    print(await get_days("Budapest", config))
    assert 0
