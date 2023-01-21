from asyncio import sleep

import async_timeout
from graphene import Field, ObjectType, ResolveInfo, String

from claude.api.types import Settings
from claude.components.graphene.tools import get_field_name_list, get_request_context
from claude.components.settings.manager import SettingsKeys


def is_field_queried(field_names: list[str], node_name: str):
    for node_name_list in field_names:
        if node_name in node_name_list:
            return True
    return False


channel_name = "channel:1"


class Subscription(ObjectType):
    settings = Field(Settings)

    async def subscribe_settings(root, info: ResolveInfo):
        field_names = [fn.split(".") for fn in get_field_name_list(info.field_nodes[0])]
        keys = [key for key in SettingsKeys if is_field_queried(field_names, key.name)]
        request_context = get_request_context(info)

        psub = request_context.redis.pubsub()

        async with psub as channel:
            await channel.subscribe(channel_name)
            async for _ in channel.listen():
                print("on message")
                data = await request_context.settings_manager.get_settings(*keys)
                yield data
