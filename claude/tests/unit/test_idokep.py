import pytest
from claude.components.weather.idokep.config import (
    IdokepCurrentParserConfig,
    IdokepDaysParserConfig,
    IdokepHoursParserConfig,
)

from claude.components.weather.idokep.parsers import get_current, get_days, get_hours
from claude.tests.unit.tools import mock_fetch_url


@pytest.mark.asyncio
async def test_current():
    config = IdokepCurrentParserConfig(
        container=".current-weather-lockup",
        image=".current-weather-icon > img",
        temperature=".current-temperature",
    )
    with mock_fetch_url("idokep_current.html"):
        result = await get_current("whatever", config)
    assert result.temperature == 16


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
    with mock_fetch_url("idokep_days.html"):
        result = await get_days("whatever", config)

    assert len(result) == 22
    assert result[0].temperature.min == 10
    assert result[0].temperature.max == 20
    assert result[0].day == 2


@pytest.mark.asyncio
async def test_hours():
    config = IdokepHoursParserConfig(
        columns=".new-hourly-forecast-card",
        rain_chance_prob=".hourly-rain-chance > .interact",
        hour=".new-hourly-forecast-hour",
        image=".forecast-icon",
        temperature=".tempValue > a",
    )
    with mock_fetch_url("idokep_days.html"):
        result = await get_hours("whatever", config)

    assert len(result) == 35
    assert result[0].temperature == 15
    assert result[0].precipitation.probability == 0
    assert result[5].precipitation.probability == 30
