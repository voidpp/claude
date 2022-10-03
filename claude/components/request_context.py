from dataclasses import dataclass
from aioredis import Redis

from claude.components.config import Config


@dataclass
class RequestContext:
    redis: Redis
    config: Config
