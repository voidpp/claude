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
    assert type(result.temperature) == int


@pytest.mark.asyncio
async def test_days():
    config = IdokepDaysParserConfig(
        columns=".dailyForecastCol",
        cell=".dfColHeader .dfDayNum",
        image=".forecast-icon",
        temperature=".min-max-container a",
        rainlevel=".rainlevel-container .mm",
    )
    with mock_fetch_url("idokep_days.html"):
        result = await get_days("whatever", config)

    assert len(result) > 10
    assert result[0].temperature.min is not None
    assert result[0].temperature.max is not None
    assert result[0].day is not None


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

    assert len(result) > 10
    assert result[0].temperature is not None
    assert result[0].precipitation.probability is not None
    assert result[5].precipitation.probability is not None
