from graphene import Boolean
from pydantic import BaseModel

from claude.components.graphene.node_base import NodeBase, NodeConfig
from claude.components.settings.manager import SettingsKeys
from claude.components.settings.types import HomeAssitantServer


class SaveHomeAssitantServerValidator(BaseModel):
    home_assistant_server: HomeAssitantServer


class SaveHomeAssitantServerNode(NodeBase[SaveHomeAssitantServerValidator]):
    config = NodeConfig(
        result_type=Boolean,
        input_validator=SaveHomeAssitantServerValidator,
    )

    async def resolve(self):
        await self.request_context.settings_manager.save_setting(
            SettingsKeys.home_assistant_server, self.args.home_assistant_server
        )
        return True
