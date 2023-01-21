from claude.components.graphene.pydantic import object_type_from_pydantic
from claude.components.settings import types

Settings = object_type_from_pydantic(types.Settings)
