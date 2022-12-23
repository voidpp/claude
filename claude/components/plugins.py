import importlib.util
from pathlib import Path
from uuid import UUID

from graphql.pyutils.convert_case import camel_to_snake

from claude.components.config import Config


class PluginManager:
    def __init__(self, config: Config):
        self._config = config

    def plugin_file_path(self, id: UUID) -> Path:
        file_path = Path(self._config.plugins_folder) / str(id)
        file_path = file_path.with_suffix(".py")
        return file_path

    def save_plugin_file(self, id: UUID, content: str):
        file_path = self.plugin_file_path(id)
        file_path.write_text(content)

    def load_plugin_class(self, id: UUID, class_name: str):
        file_path = self.plugin_file_path(id)
        name = camel_to_snake(class_name) + file_path.name

        spec = importlib.util.spec_from_file_location(name, str(file_path))
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)

        return getattr(module, class_name)
