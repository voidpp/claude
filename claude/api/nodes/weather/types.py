from uuid import UUID

from pydantic import BaseModel


class WeatherNodeValidator(BaseModel):
    city: str
    provider_id: UUID
