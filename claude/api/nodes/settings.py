from graphene import Boolean
from pydantic import BaseModel

from claude.components.graphene.node_base import NodeBase, NodeConfig
from claude.components.graphene.pydantic import object_type_from_pydantic
from claude.components.settings.types import Settings


class SettingsNode(NodeBase):
    config = NodeConfig(
        result_type=object_type_from_pydantic(Settings),
    )

    async def resolve(self):
        return await self.request_context.settings_manager.get_settings()
