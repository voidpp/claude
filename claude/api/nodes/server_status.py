from datetime import timedelta

from pydantic import BaseModel

from claude.components.graphene.node_base import NodeBase, NodeConfig
from claude.components.graphene.pydantic import object_type_from_pydantic
from claude.components.server_status.fetcher import get_server_status
from claude.components.server_status.types import ServerStatusResponse


class ServerStatusNodeValidator(BaseModel):
    ip: str
    status_server_port: int


class ServerStatusNode(NodeBase[ServerStatusNodeValidator]):
    config = NodeConfig(
        result_type=object_type_from_pydantic(ServerStatusResponse),
        input_validator=ServerStatusNodeValidator,
    )

    async def resolve(self):
        return await get_server_status(self.args.ip, self.args.status_server_port)
