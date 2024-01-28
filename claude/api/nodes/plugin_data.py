from uuid import UUID

from pydantic import BaseModel

from claude.components.graphene.node_base import NodeBase, NodeConfig
from claude.components.graphene.pydantic import object_type_from_pydantic
from claude.components.settings.types import PluginData


class PluginDataNodeValidator(BaseModel):
    id: str


class PluginDataNode(NodeBase[PluginDataNodeValidator]):
    config = NodeConfig(
        result_type=object_type_from_pydantic(PluginData),
        input_validator=PluginDataNodeValidator,
    )

    async def resolve(self):
        return PluginData(
            content=self.plugin_manager.plugin_file_path(self.args.id).read_text(),
            metadata=await self.find_plugin(UUID(self.args.id))
        )
