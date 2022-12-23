from dataclasses import dataclass

from aioredis import Redis

from claude.components.config import Config
from claude.components.plugins import PluginManager
from claude.components.settings.manager import SettingsManager


@dataclass
class RequestContext:
    redis: Redis
    config: Config
    settings_manager: SettingsManager
    plugin_manager: PluginManager
