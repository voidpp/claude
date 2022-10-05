from graphene import Field, Int, ObjectType, String
from pydantic import BaseModel
from claude.components.tools import create_json_serializable_data

import pytest


class SomeData(BaseModel):
    var1: str
    var2: int


class SomeGrapheneData(ObjectType):
    var1 = Field(String)
    var2 = Field(Int)


@pytest.mark.parametrize(
    "data, result",
    [
        ("string", "string"),
        ({"key1", 42}, {"key1", 42}),
        (SomeData(var1="val1", var2=42), {"var1": "val1", "var2": 42}),
        ([SomeData(var1="val1", var2=42)], [{"var1": "val1", "var2": 42}]),
        (SomeGrapheneData("val1", 42), {"var1": "val1", "var2": 42}),
    ],
)
def test_create_json_serializable_data(data, result):
    assert create_json_serializable_data(data) == result
