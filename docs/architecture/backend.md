# Backend Architecture

## Entry Point

`claude/app.py` — `get_app()` is the ASGI application factory. It:

1. Reads environment via `env.py` and config via `config.py`.
2. Creates a shared `aioredis` client.
3. Instantiates `SettingsManager` and `PluginManager`.
4. Wraps them in a `RequestContext` dataclass.
5. Builds the Starlette application with middleware and routes.

## Application Structure

```
claude/
├── app.py                  # ASGI factory
├── env.py                  # Environment schema (CLAUDE_* vars)
├── constants.py            # Shared constants (pub/sub channel name)
├── endpoints.py            # index() — SPA fallback (serves index.html)
│
├── api/
│   ├── schema.py           # GraphQL schema assembly
│   ├── queries.py          # Query root type
│   ├── mutations.py        # Mutation root type
│   ├── subscriptions.py    # Subscription root type
│   ├── types.py            # Shared GraphQL output types
│   └── nodes/              # One module per operation
│       ├── cache.py        # requestCache — HTTP proxy with Redis cache
│       ├── plugin_data.py  # pluginData — read plugin file + metadata
│       ├── server_status.py
│       ├── settings.py     # settings query
│       ├── sunset_sunrise.py
│       ├── save_*.py       # CRUD mutations (dashboard, widget, plugin, …)
│       ├── remove_*.py
│       └── weather/
│           ├── current.py
│           ├── days.py
│           └── hours.py
│
└── components/
    ├── config.py           # Config Pydantic model + YAML loader
    ├── env.py              # EnvironmentSchema
    ├── fetcher.py          # Async HTTP/XML/JSON fetcher (httpx)
    ├── folders.py          # Filesystem path constants
    ├── injection_middleware.py
    ├── logging.py          # Logger initialisation
    ├── plugins.py          # PluginManager
    ├── request_context.py  # RequestContext dataclass
    ├── tools.py            # Utility functions
    ├── types.py            # RequestScopeKeys enum
    │
    ├── graphene/
    │   ├── node_base.py    # NodeBase — base class for all resolvers
    │   ├── pydantic.py     # Pydantic → Graphene type conversion
    │   └── tools.py        # GraphQL utility helpers
    │
    ├── settings/
    │   ├── manager.py      # SettingsManager + SettingsKey / MultiSettingsKey
    │   └── types.py        # Pydantic models for all settings entities
    │
    ├── server_status/
    │   ├── fetcher.py      # ping + HTTP status checks
    │   └── types.py
    │
    └── weather/
        ├── plugin.py       # WeatherProvider ABC
        └── types.py        # CurrentWeather, DayForecast, HourForecast
```

## Middleware Stack

```
Request
  │
  ▼
InjectionMiddleware
  Injects RequestContext into the ASGI scope under RequestScopeKeys.CONTEXT.
  All downstream code retrieves it via get_request_context(info).
  │
  ▼
CORSMiddleware
  allow_origins=["*"] — permissive; suitable for local self-hosting.
  │
  ▼
Starlette Router
  /static, /assets → StaticFiles
  /api             → LoggedGraphQLApp (timing middleware wrapper)
  /*               → index() SPA fallback
```

## NodeBase — Resolver Base Class

Every GraphQL field resolver is implemented as a `NodeBase` subclass (`claude/components/graphene/node_base.py`). The base class provides:

- **Input validation** — a Pydantic `BaseModel` subclass is declared as `config.input_validator`; the framework converts it to a Graphene `InputObjectType` and validates incoming kwargs automatically.
- **Transparent caching** — if `config.cache_expiry_time` is set, resolved data is serialized to Redis on first call and returned from cache on subsequent calls within the TTL. The cache key is `ClassName_base64(sorted_kwargs)`.
- **Plugin loading** — `load_plugin()` / `find_plugin()` helpers for nodes that need to invoke a plugin.
- **Field selection awareness** — `is_field_queried(name)` inspects the GraphQL field AST so resolvers can fetch only the Redis keys actually requested (used by `SettingsNode`).
- **Field factory** — `NodeBase.field()` generates the Graphene `Field(...)` declaration from `NodeConfig`, keeping schema and resolver in the same class.

```python
class NodeConfig:
    result_type: OrderedType        # Graphene output type
    input_validator: Type[BaseModel] = None
    description: str = None
    cache_expiry_time: timedelta = None
```

### Execution flow per resolver

```
GraphQL request
  │
  ▼
NodeBase._resolve(root, info, **kwargs)   # class method, registered as Graphene resolver
  │
  ├── get_data_from_cache()  ──► return cached data (if hit)
  │
  ├── validate()             # hook for subclass validation
  │
  ├── resolve()              # subclass implementation
  │
  └── set_data_to_cache()    # store result if cache_expiry_time set
```

## Dependency Injection

`RequestContext` is a frozen dataclass:

```python
@dataclass
class RequestContext:
    redis: Redis
    config: Config
    settings_manager: SettingsManager
    plugin_manager: PluginManager
```

It is created once at startup and injected into every ASGI scope by `InjectionMiddleware`. Resolvers access it via `get_request_context(info)`, which reads `info.context["request"].scope[RequestScopeKeys.CONTEXT]`.

## Fetcher

`claude/components/fetcher.py` — a lightweight async HTTP utility built on httpx. Provides:

- `fetch_url(url)` → raw string
- `fetch_xml(url)` → lxml `ElementTree`
- `fetch_json(url)` → parsed dict/list

Used by weather nodes, server status, and sunrise/sunset resolvers.

## Logging

`init_logger(debug)` in `claude/components/logging.py` configures the root logger. In dev mode (debug=True), log level is `DEBUG`; otherwise `INFO`. Query execution time is logged at DEBUG level by `LoggedGraphQLApp`.
