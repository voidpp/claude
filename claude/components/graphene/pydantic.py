import enum
import inspect
from datetime import datetime
from ipaddress import IPv4Address
from typing import Tuple, Type, Union, get_args, get_origin

from graphene import (
    Boolean,
    DateTime,
    Enum,
    Field,
    Float,
    InputObjectType,
    Int,
    List,
    ObjectType,
    String,
)
from graphene.types.base import BaseType
from pydantic import BaseModel

VALIDATOR_CLASS_NAME_PREFIX = "Validator"


class ConversionError(Exception):
    pass


def input_object_type_from_pydantic(name: str, model: Type[BaseModel]) -> type:
    return object_type_from_pydantic(model, name, InputObjectType)


_graphene_type_registry: dict[str, List] = {}


def clear_type_registry() -> None:
    _graphene_type_registry.clear()


def object_type_from_pydantic(
    model: Type[BaseModel], name: str = None, base_type: Type[BaseType] = ObjectType, ignored_fields: list[str] = None
) -> type:
    model_name = name or model.__name__

    type_ = _graphene_type_registry.get(
        model_name,
        type(
            model_name,
            (base_type,),
            create_class_property_dict(model, base_type, ignored_fields),
        ),
    )

    _graphene_type_registry[model_name] = type_

    return type_


def create_class_property_dict(
    model: Type[BaseModel], sub_type: Type[BaseType] = ObjectType, ignored_fields: list[str] = None
) -> dict:
    properties = {}
    collector = AnnotationsCollector(model)
    collector.collect()
    for property_name, type_ in collector.annotations.items():
        if ignored_fields and property_name in ignored_fields:
            continue

        description = None
        required = False

        if field := model.__fields__.get(property_name):
            description = field.field_info.description
            required = field.required

        if type_ in _TYPE_MAP_SCALARS:
            properties[property_name] = _TYPE_MAP_SCALARS[type_](required=required, description=description)
            continue

        if type(type_) == enum.EnumMeta:
            graphene_enum_type = create_graphene_enum(type_)
            properties[property_name] = graphene_enum_type(required=required, description=description)
            continue

        if get_origin(type_) == list:
            list_item_class = _create_list_item_class(type_, sub_type)
            properties[property_name] = List(list_item_class, required=required, description=description)
            continue

        type_base = get_base_scalar_type(type_)
        if type_base in _TYPE_MAP_SCALARS:
            properties[property_name] = _TYPE_MAP_SCALARS[type_base](required=required, description=description)
            continue

        if issubclass(type_, (BaseModel,)):
            properties[property_name] = Field(object_type_from_pydantic(type_))
            continue

        raise ConversionError(f"Conversion not implemented for type '{type_}'")

    return properties


def create_graphene_enum(type_: Type[enum.Enum]) -> Type[Enum]:
    enum_name = type_.__name__
    graphene_enum_type = _graphene_type_registry.get(enum_name, Enum.from_enum(type_))
    _graphene_type_registry[enum_name] = graphene_enum_type
    return graphene_enum_type


def _create_list_item_class(type_: type, sub_type: Type[BaseType] = ObjectType) -> type:
    class_ = get_args(type_)[0]

    if class_ in _TYPE_MAP_SCALARS:
        return _TYPE_MAP_SCALARS[class_]

    if BaseModel in inspect.getmro(class_):
        list_item_class_name = class_.__name__.replace(VALIDATOR_CLASS_NAME_PREFIX, "")

        list_item_class = _graphene_type_registry.get(
            list_item_class_name, object_type_from_pydantic(class_, list_item_class_name, sub_type)
        )

        _graphene_type_registry[list_item_class_name] = list_item_class
        return list_item_class

    raise ConversionError(f"Unhandled list item type: '{class_}'")


class AnnotationsCollector:
    def __init__(self, model: type):
        self._model = model
        self._annotations = {}

    def collect(self) -> None:
        self._collect_from_single(self._model)
        self._collect_from_multiple(self._model.__bases__)

    def _collect_from_multiple(self, models: Tuple[type]):
        if not models:
            return

        bases: Union[Tuple[type], Tuple] = ()
        for model in models:
            bases += model.__bases__
            self._collect_from_single(model)

        self._collect_from_multiple(bases)

    def _collect_from_single(self, model: type):
        if not hasattr(model, "__annotations__"):
            return

        for key, value in model.__annotations__.items():
            if key.startswith("_"):
                continue
            if self._annotations.get(key) is None:
                self._annotations[key] = value

    @property
    def annotations(self) -> dict:
        return self._annotations


def get_base_scalar_type(type_) -> type:
    for key in _TYPE_MAP_SCALARS.keys():
        if issubclass(type_, key):
            return key
    return type


_TYPE_MAP_SCALARS = {
    int: Int,
    float: Float,
    str: String,
    bool: Boolean,
    datetime: DateTime,
    dict: String,  # in GraphQL the 'dict' type doesn't exists intentionally
    IPv4Address: String,
}
