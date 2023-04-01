import base64
import json
import logging

from httpx import AsyncClient
from pydantic import BaseModel

from claude.components.graphene.node_base import NodeBase, NodeConfig
from claude.components.graphene.pydantic import object_type_from_pydantic

logger = logging.getLogger(__name__)


class Header(BaseModel):
    name: str
    value: str


class RequestCacheNodeValidator(BaseModel):
    url: str
    cache_seconds: int
    method: str = "GET"
    headers: list[Header] = None


class RequestCacheResult(BaseModel):
    content: str
    code: int


class RequestCacheNode(NodeBase[RequestCacheNodeValidator]):
    config = NodeConfig(
        result_type=object_type_from_pydantic(RequestCacheResult),
        input_validator=RequestCacheNodeValidator,
    )

    async def _fetch(self):
        logger.info("sending request to %s", self.args.url)
        input_headers = self.args.headers or []
        headers = [(h.name, h.value) for h in input_headers]
        async with AsyncClient() as client:
            response = await client.request(self.args.method, self.args.url, headers=headers)
            return RequestCacheResult(content=response.text, code=response.status_code)

    async def resolve(self):
        key = base64.encodebytes(json.dumps(self.args.dict()).encode())

        if data := await self.request_context.redis.get(key):
            logger.info("get data from cache. url: %s", self.args.url)
            return json.loads(data)

        data = await self._fetch()

        await self.request_context.redis.set(key, json.dumps(data.dict()), self.args.cache_seconds)

        return data
