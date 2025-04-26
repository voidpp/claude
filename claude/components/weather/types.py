from pydantic import BaseModel


class CurrentWeather(BaseModel):
    image: str
    temperature: int


class Range(BaseModel):
    min: int
    max: int


class Precipitation(BaseModel):
    value: int
    probability: int | None = None


class DayForecast(BaseModel):
    day: int
    date: str
    image: str
    temperature: Range
    precipitation: Precipitation


class HourForecast(BaseModel):
    hour: int
    image: str
    temperature: float
    precipitation: Precipitation
