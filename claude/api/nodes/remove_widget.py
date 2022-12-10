from uuid import UUID

from graphene import Boolean
from pydantic import BaseModel

from claude.components.graphene.node_base import NodeBase, NodeConfig
from claude.components.settings.manager import SettingsKeys


class RemoveWidgetValidator(BaseModel):
    id: UUID


class RemoveWidgetNode(NodeBase[RemoveWidgetValidator]):
    config = NodeConfig(
        result_type=Boolean,
        input_validator=RemoveWidgetValidator,
    )

    async def resolve(self):
        # TODO: check id
        await self.request_context.settings_manager.delete_setting(SettingsKeys.widgets, [self.args.id])
        return True
