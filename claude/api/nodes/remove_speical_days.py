from graphene import Boolean
from pydantic import BaseModel

from claude.components.graphene.node_base import NodeBase, NodeConfig
from claude.components.settings.manager import SettingsKeys
from claude.components.settings.types import SpecialDayId, get_special_day_id


class RemoveSpeicalDaysValidator(BaseModel):
    ids: list[SpecialDayId]


class RemoveSpeicalDaysNode(NodeBase[RemoveSpeicalDaysValidator]):
    config = NodeConfig(
        result_type=Boolean,
        input_validator=RemoveSpeicalDaysValidator,
    )

    async def resolve(self):
        ids = [get_special_day_id(id) for id in self.args.ids]
        await self.request_context.settings_manager.delete_setting(SettingsKeys.special_days, ids)
        return True
