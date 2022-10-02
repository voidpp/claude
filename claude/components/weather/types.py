from pydantic import BaseModel


class CurrentWeather(BaseModel):
    image: str
    temperature: int


class Range(BaseModel):
    min: int
    max: int


class DayForecast(BaseModel):
    day: int
    date: str
    image: str
    temperature: Range


class Precipitation(BaseModel):
    value: int
    probability: int


class HourForecast(BaseModel):
    hour: int
    image: str
    temperature: int
    precipitation: Precipitation
