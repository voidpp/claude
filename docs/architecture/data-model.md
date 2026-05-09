# Data Model & Persistence

## Overview

All application state is stored in Redis. There is no relational database. Every settings entity uses a simple key-value or multi-key pattern. Settings changes are broadcast via a Redis pub/sub channel so every connected browser receives updates instantly.

## Pydantic Models (`claude/components/settings/types.py`)

### Dashboard

```python
class Dashboard(BaseModel):
    id: UUID
    name: str
    step_size: int       # grid snap size in pixels
    background: str      # background image path or CSS value
    theme: str
    locale: str          # e.g. "en", "hu"
```

### Widget

```python
class Widget(BaseModel):
    id: UUID
    dashboard_id: UUID
    type: str            # key into widgetRegistry, e.g. "clock", "currentWeather"
    x: int               # position in pixels
    y: int
    width: int
    height: int
    settings: dict       # widget-type-specific, stored as JSON string
```

### Plugin

```python
class PluginType(Enum):
    WEATHER = "weather"

class Plugin(BaseModel):
    id: UUID
    name: str
    type: PluginType
    class_name: str      # Python class name inside the plugin file
```

### SpecialDay

```python
class SpecialDayType(Enum):
    NON_WORKING_DAY = "non_working_day"
    RELOCATED_REST_DAY = "relocated_rest_day"
    RELOCATED_WORKING_DAY = "relocated_working_day"

class SpecialDay(BaseModel):
    date: date
    locale: str
    type: SpecialDayType
```

### FreeCurrencyAPIAccount

```python
class FreeCurrencyAPIAccount(BaseModel):
    id: UUID
    name: str
    api_key: str
```

### HomeAssistantServer

```python
class HomeAssitantServer(BaseModel):
    enabled: bool
    url: str             # HTTP URL of the HA instance
    api_token: str       # Long-lived access token
```

### Settings (aggregate)

```python
class Settings(BaseModel):
    dashboards: list[Dashboard] = None
    widgets: list[Widget] = None
    plugins: list[Plugin] = None
    special_days: list[SpecialDay] = None
    free_currency_api_accounts: list[FreeCurrencyAPIAccount] = None
    home_assistant_server: HomeAssitantServer | None = None
```

## Redis Key Schema

All keys use the prefix `claude_settings`.

| SettingsKey name | Redis key pattern | Type | Value |
|---|---|---|---|
| `dashboards` | `claude_settings_dashboard_{uuid}` | string | JSON object |
| `widgets` | `claude_settings_widget_{uuid}` | string | JSON object |
| `plugins` | `claude_settings_plugin_{uuid}` | string | JSON object |
| `special_days` | `claude_settings_special_day_{date}{locale}` | string | JSON object |
| `free_currency_api_accounts` | `claude_settings_free_currency_api_account_{uuid}` | string | JSON object |
| `home_assistant_server` | `claude_settings_home_assistant_server` | string | JSON object |

Multi-entity types (dashboards, widgets, plugins, special_days, free_currency_api_accounts) store one Redis key per entity. Reads use `KEYS claude_settings_<type>_*` + `MGET`.

Single-entity settings (home_assistant_server) use a single key with `GET`/`SET`.

### Response cache keys

The `requestCache` query and `NodeBase` caching also store values in Redis, but with different key formats:

- `requestCache`: `base64(json(sorted_args))` → raw response, expires after `cache_seconds`
- NodeBase cache: `{ClassName}_{base64(sorted_kwargs)}` → orjson-serialized result, expires after `cache_expiry_time`

## SettingsManager (`claude/components/settings/manager.py`)

```python
class SettingsManager:
    async def get_settings(self, *keys: SettingsKeys) -> Settings
    async def save_setting(self, key: SettingsKey, data: Any)
    async def delete_setting(self, key: SettingsKey, data: Any = None)
    async def publish_change(self)
```

Every write calls `publish_change()`, which publishes an arbitrary payload (`"42"`) to the `SETTINGS_PUBSUB_CHANNEL_NAME` Redis channel. The subscription resolver listens on this channel and pushes fresh settings to all subscribed browsers.

## Real-Time Sync (Pub/Sub)

```
Browser A mutates widget position
    │
    ▼
SaveWidgetNode.resolve()
    │
    ▼
SettingsManager.save_setting()
    ├── redis.mset(...)          # persist to Redis
    └── redis.publish(channel)  # notify all subscribers
                                        │
                    ┌───────────────────┘
                    │  (for every active WebSocket connection)
                    ▼
        Subscription.subscribe_settings()
            │
            ├── re-fetches queried settings keys from Redis
            └── yields new Settings object → pushed to browser

Browser A         Browser B         Browser C
   ▲                  ▲                  ▲
   │                  │                  │
   └──────────────────┴──────────────────┘
              all receive update
```

The subscription resolver (`claude/api/subscriptions.py`) inspects the GraphQL field selection of each subscriber and only fetches the Redis keys that subscriber actually asked for, minimizing unnecessary reads.
