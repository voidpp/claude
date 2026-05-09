# Plugin System

## Purpose

The plugin system allows users to add custom weather data providers without modifying the core application. Plugins are Python source files uploaded through the admin UI, stored on disk, and dynamically loaded at query time.

Currently the only plugin type is `weather`.

## Plugin Lifecycle

### 1. Upload (admin UI)

The user navigates to **Admin → Plugins**, pastes or uploads a Python file, and submits the form with:
- `name` — display name
- `type` — `"weather"` (only option today)
- `className` — the Python class name inside the file

### 2. Save (`SavePluginNode`)

`claude/api/nodes/save_plugin.py`:

1. `PluginManager.save_plugin_file(id, content)` — writes the file to `{plugins_folder}/{id}.py`.
2. Immediately tries to load the class via `load_plugin_class(id, class_name)` as a validation step. If import or attribute lookup fails, the error is returned to the client without saving the metadata.
3. If validation passes, saves the `Plugin` metadata to Redis via `SettingsManager`.

### 3. Load (query time)

`NodeBase.load_plugin(id)`:

1. Looks up the `Plugin` metadata from Redis.
2. Calls `PluginManager.load_plugin_class(id, plugin.class_name)`.
3. Returns a fresh instance of the class.

`PluginManager.load_plugin_class` uses Python's `importlib`:

```python
spec = importlib.util.spec_from_file_location(module_name, str(file_path))
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
return getattr(module, class_name)
```

The class is re-loaded from disk on every invocation (no module caching). This allows hot-reloading of plugin code without restarting the server.

## Weather Provider Interface

All weather plugins must extend `WeatherProvider`:

```python
# claude/components/weather/plugin.py
from abc import ABC, abstractmethod
from claude.components.weather.types import CurrentWeather, DayForecast, HourForecast

class WeatherProvider(ABC):
    @abstractmethod
    async def get_current(self, city: str) -> CurrentWeather: ...

    @abstractmethod
    async def get_days(self, city: str) -> list[DayForecast]: ...

    @abstractmethod
    async def get_hours(self, city: str) -> list[HourForecast]: ...
```

### Return types

```python
class CurrentWeather(BaseModel):
    image: str          # icon URL or identifier
    temperature: int    # degrees Celsius

class DayForecast(BaseModel):
    day: int
    date: str
    image: str
    temperature: Range  # {min: int, max: int}
    precipitation: Precipitation  # {value: int, probability: int | None}

class HourForecast(BaseModel):
    hour: int
    image: str
    temperature: float
    precipitation: Precipitation
```

## Example Plugin Skeleton

```python
from claude.components.weather.plugin import WeatherProvider
from claude.components.weather.types import CurrentWeather, DayForecast, HourForecast

class MyWeatherProvider(WeatherProvider):
    async def get_current(self, city: str) -> CurrentWeather:
        # fetch from your weather API
        return CurrentWeather(image="sunny.png", temperature=22)

    async def get_days(self, city: str) -> list[DayForecast]:
        ...

    async def get_hours(self, city: str) -> list[HourForecast]:
        ...
```

The class name (`MyWeatherProvider`) must match what was registered in the admin UI.

## File Storage

Plugin files are stored as `{plugins_folder}/{uuid}.py`. The `plugins_folder` path is set in the YAML config. The folder must be created manually before starting the server.

## Security Considerations

Plugins execute arbitrary Python code inside the server process with full system access. Only trusted users should have access to the admin UI's plugin upload feature.
