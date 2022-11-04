import os
from enum import Enum


class RequestScopeKeys:
    CONTEXT = "CONTEXT"


class Environment(str, Enum):
    CONFIG_FILE = "CLAUDE_CONFIG_FILE"
    DEV_MODE = "DEV_MODE"

    def get(self, default=...):
        return os.environ.get(self.value, default)

    def set(self, value):
        os.environ[self.value] = value
