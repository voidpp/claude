from dataclasses import dataclass
from enum import Enum
from typing import Any, Callable, Generic, TypeVar

import orjson
from aioredis import Redis
from pydantic import BaseModel

from claude.components.settings.types import (
    Dashboard,
    Plugin,
    Settings,
    SpecialDay,
    Widget,
    get_special_day_id,
)
from claude.constants import SETTINGS_PUBSUB_CHANNEL_NAME

GENERAL_KEYS_PREFIX = "claude_settings"


@dataclass
class SettingsKey:
    name: str

    @property
    def key(self):
        return f"{GENERAL_KEYS_PREFIX}_{self.name}"

    async def get_data(self, redis: Redis):
        return await redis.get(self.key)

    async def save_data(self, redis: Redis, data: Any):
        return await redis.set(self.key, data)

    async def delete_data(self, redis: Redis, data: Any = None):
        return await redis.delete(self.key)


SettingsItemType = TypeVar("SettingsItemType")


def default(obj):
    if isinstance(obj, BaseModel):
        return obj.dict()
    raise TypeError


@dataclass
class MultiSettingsKey(SettingsKey, Generic[SettingsItemType]):
    load: Callable[[str], SettingsItemType]
    get_item_key_postfix: Callable[[SettingsItemType], str]

    async def get_data(self, redis: Redis):
        found_keys = await redis.keys(f"{self.key}_*")
        if not found_keys:
            return []
        items = await redis.mget(found_keys)
        return [self.load(**orjson.loads(item)) for item in items if item]

    async def save_data(self, redis: Redis, items: list[SettingsItemType]):
        data = {f"{self.key}_{self.get_item_key_postfix(item)}": orjson.dumps(item, default) for item in items}
        await redis.mset(data)

    async def delete_data(self, redis: Redis, items: list[str]):
        for key in items:
            await redis.delete(f"{self.key}_{key}")


class SettingsKeys(Enum):
    dashboards = MultiSettingsKey("dashboard", Dashboard, lambda item: item.id)
    widgets = MultiSettingsKey("widget", Widget, lambda item: item.id)
    plugins = MultiSettingsKey("plugin", Plugin, lambda item: item.id)
    special_days = MultiSettingsKey("special_day", SpecialDay, lambda item: get_special_day_id(item))


class SettingsManager:
    def __init__(self, redis: Redis):
        self._redis = redis

    async def get_settings(self, *keys: SettingsKeys) -> Settings:
        data = {}
        for key in keys:
            data[key.name] = await key.value.get_data(self._redis)
        return Settings(**data)

    async def publish_change(self):
        await self._redis.publish(SETTINGS_PUBSUB_CHANNEL_NAME, "42")

    async def save_setting(self, key: SettingsKey, data: Any):
        await self.publish_change()
        await key.value.save_data(self._redis, data)

    async def delete_setting(self, key: SettingsKey, data: Any = None):
        await self.publish_change()
        await key.value.delete_data(self._redis, data)
