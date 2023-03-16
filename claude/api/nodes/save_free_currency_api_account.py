from graphene import Boolean
from pydantic import BaseModel

from claude.components.graphene.node_base import NodeBase, NodeConfig
from claude.components.settings.manager import SettingsKeys
from claude.components.settings.types import FreeCurrencyAPIAccount


class FreeCurrencyAPIAccountInput(FreeCurrencyAPIAccount):
    pass


class SaveFreeCurrencyAPIAccountValidator(BaseModel):
    free_currency_api_account: FreeCurrencyAPIAccountInput


class SaveFreeCurrencyAPIAccountNode(NodeBase[SaveFreeCurrencyAPIAccountValidator]):
    config = NodeConfig(
        result_type=Boolean,
        input_validator=SaveFreeCurrencyAPIAccountValidator,
    )

    async def resolve(self):
        await self.request_context.settings_manager.save_setting(
            SettingsKeys.free_currency_api_accounts, [self.args.free_currency_api_account]
        )
        return True
