from claude.components.graphene.node_base import NodeBase, NodeConfig
from claude.components.graphene.pydantic import object_type_from_pydantic
from claude.components.settings.manager import SettingsKeys
from claude.components.settings.types import Settings


class SettingsNode(NodeBase):
    config = NodeConfig(
        result_type=object_type_from_pydantic(Settings),
    )

    async def resolve(self):
        keys = [key for key in SettingsKeys if self.is_field_queried(key.name)]
        return await self.request_context.settings_manager.get_settings(*keys)
