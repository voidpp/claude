from pydantic import BaseModel


class IdokepCurrentParserConfig(BaseModel):
    container: str
    image: str
    temperature: str


class RangeParserConfig(BaseModel):
    min: str
    max: str


class IdokepDaysParserConfig(BaseModel):
    columns: str
    cell: str
    image: str
    temperature: RangeParserConfig
