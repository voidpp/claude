from graphene import Boolean
from pydantic import BaseModel

from claude.components.graphene.node_base import NodeBase, NodeConfig
from claude.components.settings.manager import SettingsKeys
from claude.components.settings.types import Widget


class WidgetInput(Widget):
    pass


class SaveWidgetValidator(BaseModel):
    widget: WidgetInput


class SaveWidgetNode(NodeBase[SaveWidgetValidator]):
    config = NodeConfig(
        result_type=Boolean,
        input_validator=SaveWidgetValidator,
    )

    async def resolve(self):
        # TODO: check dashboard_id
        await self.request_context.settings_manager.save_setting(SettingsKeys.widgets, [self.args.widget])
        return True
