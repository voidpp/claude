from uuid import UUID

from graphene import Boolean
from pydantic import BaseModel

from claude.components.graphene.node_base import NodeBase, NodeConfig
from claude.components.settings.manager import SettingsKeys


class RemoveFreeCurrencyAPIAccountValidator(BaseModel):
    id: UUID


class RemoveFreeCurrencyAPIAccountNode(NodeBase[RemoveFreeCurrencyAPIAccountValidator]):
    config = NodeConfig(
        result_type=Boolean,
        input_validator=RemoveFreeCurrencyAPIAccountValidator,
    )

    async def resolve(self):
        await self.request_context.settings_manager.delete_setting(
            SettingsKeys.free_currency_api_accounts, [self.args.id]
        )
        return True
