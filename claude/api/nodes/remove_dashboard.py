from uuid import UUID

from graphene import Boolean
from pydantic import BaseModel

from claude.components.graphene.node_base import NodeBase, NodeConfig
from claude.components.settings.manager import SettingsKeys


class RemoveDashboardValidator(BaseModel):
    id: UUID


class RemoveDashboardNode(NodeBase[RemoveDashboardValidator]):
    config = NodeConfig(
        result_type=Boolean,
        input_validator=RemoveDashboardValidator,
    )

    async def resolve(self):
        settings = await self.request_context.settings_manager.get_settings(SettingsKeys.widgets)

        if remove_widget_ids := [w.id for w in settings.widgets]:
            await self.request_context.settings_manager.delete_setting(SettingsKeys.widgets, remove_widget_ids)

        await self.request_context.settings_manager.delete_setting(SettingsKeys.dashboards, [self.args.id])

        return True
