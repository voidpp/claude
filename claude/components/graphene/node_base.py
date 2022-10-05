from abc import ABC, abstractmethod
import base64
from datetime import timedelta
from functools import cached_property
import json
from typing import Type, TypeVar, Generic

from graphene import Field, ResolveInfo
from graphene.utils.orderedtype import OrderedType
from pydantic import BaseModel
from claude.components.request_context import RequestContext
from claude.components.tools import create_json_serializable_data

from claude.components.types import RequestScopeKeys

from .pydantic import create_class_property_dict

InputType = TypeVar("InputType")


class NoArgumentsDefinedError(Exception):
    pass


class ValidationError(Exception):
    def __init__(self, result):
        super().__init__("ValidationError")
        self.result = result


def get_request_context(info: ResolveInfo) -> RequestContext:
    return info.context["request"].scope[RequestScopeKeys.CONTEXT]


class NodeBase(ABC, Generic[InputType]):
    result_type: OrderedType
    input_validator: Type[BaseModel] = None
    description: str = None
    cache_expiry_time: timedelta = None

    _info: ResolveInfo
    _args: InputType = None

    def __init__(self, root, info, **kwargs):
        self._root = root
        self._info = info

        self._kwargs = kwargs

    @abstractmethod
    async def resolve(self):
        pass

    @property
    def request_context(self) -> RequestContext:
        return get_request_context(self._info)

    @property
    def args(self) -> InputType:
        if not self.input_validator:
            raise NoArgumentsDefinedError
        if self._args:
            return self._args
        self._args = self.input_validator.construct(**self._kwargs)
        return self._args

    async def validate(self):
        pass

    @classmethod
    async def _resolve(cls, root, info, **kwargs):
        obj = cls(root, info, **kwargs)

        if data := await obj.get_data_from_cache():
            return data

        try:
            await obj.validate()
        except ValidationError as e:
            return e.result

        result = await obj.resolve()

        await obj.set_data_to_cache(result)

        return result

    async def set_data_to_cache(self, data):
        if not self.cache_expiry_time:
            return

        await self.request_context.redis.set(self.cache_key, json.dumps(create_json_serializable_data(data)))

    async def get_data_from_cache(self):
        if not self.cache_expiry_time:
            return

        if data := await self.request_context.redis.get(self.cache_key):
            return json.loads(data)

    @cached_property
    def cache_key(self) -> str:
        key = self.__class__.__name__
        if self._kwargs:
            sorted_args = dict(sorted(self._kwargs.items()))
            key += "_" + base64.encodebytes(json.dumps(sorted_args).encode()).decode()
        return key

    @classmethod
    def field(cls) -> Field:
        return Field(
            type_=cls.result_type,
            args=create_class_property_dict(cls.input_validator) if cls.input_validator else None,
            resolver=cls._resolve,
            description=cls.description,
        )
