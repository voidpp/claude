import logging
import traceback
from uuid import UUID

from pydantic import BaseModel

from claude.components.graphene.node_base import NodeBase, NodeConfig
from claude.components.graphene.pydantic import object_type_from_pydantic
from claude.components.settings.manager import SettingsKeys
from claude.components.settings.types import Plugin, PluginType

logger = logging.getLogger(__name__)


class SavePluginValidator(BaseModel):
    id: UUID
    file: str
    name: str
    type: PluginType
    class_name: str


class SavePluginResult(BaseModel):
    error: str = None


class SavePluginNode(NodeBase[SavePluginValidator]):
    config = NodeConfig(
        result_type=object_type_from_pydantic(SavePluginResult),
        input_validator=SavePluginValidator,
    )

    async def resolve(self):
        self.request_context.plugin_manager.save_plugin_file(self.args.id, self.args.file)

        try:
            self.request_context.plugin_manager.load_plugin_class(self.args.id, self.args.class_name)
        except Exception as e:
            logger.error(traceback.format_exc())
            return {"error": str(e)}

        data = Plugin(
            id=self.args.id,
            name=self.args.name,
            type=self.args.type,
            class_name=self.args.class_name,
        )
        await self.request_context.settings_manager.save_setting(SettingsKeys.plugins, [data])
        return {}
