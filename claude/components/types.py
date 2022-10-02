from dataclasses import dataclass
from aioredis import Redis


@dataclass
class RequestContext:
    redis: Redis


class RequestScopeKeys:
    CONTEXT = "CONTEXT"
