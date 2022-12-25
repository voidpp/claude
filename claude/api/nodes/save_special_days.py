from graphene import Boolean
from pydantic import BaseModel

from claude.components.graphene.node_base import NodeBase, NodeConfig
from claude.components.settings.manager import SettingsKeys
from claude.components.settings.types import SpecialDay


class SpecialDayInput(SpecialDay):
    pass


class SaveSpecialDayValidator(BaseModel):
    special_days: list[SpecialDayInput]


class SaveSpecialDaysNode(NodeBase[SaveSpecialDayValidator]):
    config = NodeConfig(
        result_type=Boolean,
        input_validator=SaveSpecialDayValidator,
    )

    async def resolve(self):
        await self.request_context.settings_manager.save_setting(SettingsKeys.special_days, self.args.special_days)
        return True
