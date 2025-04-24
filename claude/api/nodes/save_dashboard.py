from graphene import Boolean
from pydantic import BaseModel

from claude.components.graphene.node_base import NodeBase, NodeConfig
from claude.components.settings.manager import SettingsKeys
from claude.components.settings.types import Dashboard


class SaveDashboardValidator(BaseModel):
    dashboard: Dashboard


class SaveDashboardNode(NodeBase[SaveDashboardValidator]):
    config = NodeConfig(
        result_type=Boolean,
        input_validator=SaveDashboardValidator,
    )

    async def resolve(self):
        await self.request_context.settings_manager.save_setting(SettingsKeys.dashboards, [self.args.dashboard])
        return True
