from abc import ABC, abstractmethod

from .types import CurrentWeather, DayForecast, HourForecast


class WeatherProvider(ABC):
    @abstractmethod
    async def get_current(self, city: str) -> CurrentWeather:
        pass

    @abstractmethod
    async def get_days(self, city: str) -> list[DayForecast]:
        pass

    @abstractmethod
    async def get_hours(self, city: str) -> list[HourForecast]:
        pass
