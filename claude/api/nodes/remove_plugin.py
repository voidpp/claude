from uuid import UUID

from graphene import Boolean
from pydantic import BaseModel

from claude.components.graphene.node_base import NodeBase, NodeConfig
from claude.components.settings.manager import SettingsKeys


class RemovePluginValidator(BaseModel):
    id: UUID


class RemovePluginNode(NodeBase[RemovePluginValidator]):
    config = NodeConfig(
        result_type=Boolean,
        input_validator=RemovePluginValidator,
    )

    async def resolve(self):
        plugin_file = self.request_context.plugin_manager.plugin_file_path(self.args.id)
        plugin_file.unlink()

        await self.request_context.settings_manager.delete_setting(SettingsKeys.plugins, [self.args.id])
        return True
