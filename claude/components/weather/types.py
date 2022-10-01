from pydantic import BaseModel


class CurrentWeather(BaseModel):
    image: str
    temperature: int


class Range(BaseModel):
    min: int
    max: int


class DayForecast(BaseModel):
    image: str
    day: int
    date: str
    temperature: Range
