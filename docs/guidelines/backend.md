# Backend Coding Guidelines

## Formatting

- Line length: **120 characters** (Black + Ruff enforce this).
- Run `black` and `ruff --fix` before committing. Pre-commit hooks handle this automatically.
- Use **Python 3.10+ union syntax**: `str | None` not `Optional[str]`, `int | float` not `Union[int, float]`.

---

## Type Annotations

Always annotate function signatures and class attributes. Use builtin generics (`list[str]`, `dict[str, int]`) rather than `typing.List`, `typing.Dict`.

```python
# good
async def get_items(ids: list[str]) -> list[Widget]:
    ...

# bad
from typing import List
async def get_items(ids: List[str]) -> List[Widget]:
    ...
```

---

## Data Models

**Use Pydantic `BaseModel` for every data structure** — API inputs, settings entities, config, inter-component DTOs. Never pass raw dicts across boundaries.

```python
class Widget(BaseModel):
    id: UUID
    dashboard_id: UUID
    type: str
    x: int
    y: int
    width: int
    height: int
    settings: dict
```

- Optional fields use default values, not `Optional` without a default.
- Use `UUID` from `uuid` for identifiers — not bare `str`.
- Use `date` / `datetime` from `datetime` for temporal values, not strings.

---

## GraphQL Resolver Nodes

Every GraphQL field lives in its own module under `claude/api/nodes/`. Each is a class extending `NodeBase`.

### Structure

```python
from pydantic import BaseModel
from claude.components.graphene.node_base import NodeBase, NodeConfig
from claude.components.graphene.pydantic import object_type_from_pydantic
from .some_type import SomeResult

class MyNodeValidator(BaseModel):
    city: str
    plugin_id: str

class MyNode(NodeBase[MyNodeValidator]):
    config = NodeConfig(
        result_type=object_type_from_pydantic(SomeResult),
        input_validator=MyNodeValidator,
        cache_expiry_time=timedelta(minutes=10),  # omit if no caching needed
    )

    async def resolve(self):
        ...
```

### Rules

- `config` is a **class attribute** — always a `NodeConfig` instance. The metaclass enforces this; a missing `config` raises at import time.
- `input_validator` is a Pydantic model named `*NodeValidator`. The framework auto-converts it to a Graphene `InputObjectType`.
- `result_type` is derived from a Pydantic model using `object_type_from_pydantic()`. Define the result shape as a plain Pydantic model; never hand-write Graphene `ObjectType` classes for data.
- `resolve()` is always `async`.
- Use `self.is_field_queried("field_name")` to skip work for fields not requested by the client. This is especially important for expensive operations like ping or HTTP calls.
- Use `self.load_plugin(id)` to get a plugin instance — never instantiate plugin classes directly.
- Use `TaskGatherer` for parallel `asyncio` tasks within a single resolver.

### Caching

Set `cache_expiry_time` on `NodeConfig` when the resolver calls external APIs. The base class handles Redis read/write automatically. Cache key is derived from the class name and input args — no manual key management needed.

---

## Async

The entire backend is async. Rules:

- All I/O must be awaited: Redis, HTTP (use `Fetcher` or httpx `AsyncClient`), subprocess (use `check_output`).
- Never use `requests` or synchronous file I/O on the hot path.
- For parallel tasks in one resolver, use `TaskGatherer` (not bare `asyncio.gather` with positional results — named results are less error-prone).

```python
tasks = TaskGatherer()
if self.is_field_queried("status"):
    tasks.append_task(get_server_status(ip, port), "status")
if self.is_field_queried("ping"):
    tasks.append_task(get_server_ping(ip), "ping")
results = await tasks.wait()
```

---

## Enumerations

Use `Enum` for any set of named constants, especially for discriminated union fields.

```python
class PluginType(Enum):
    WEATHER = "weather"
```

Use `SettingsKeys` enum pattern (value is a `SettingsKey` instance) when keys have associated behavior — this avoids switch statements scattered across the codebase.

---

## Dependency Injection

Never import `redis_client`, `settings_manager`, or `plugin_manager` at module level or construct them inside resolvers. Access them through `self.request_context`:

```python
# good
await self.request_context.settings_manager.save_setting(...)

# bad
from claude.app import get_redis  # don't do this
```

`RequestContext` is injected per-request via `InjectionMiddleware`. It is the single source of truth for all shared state.

---

## Settings Persistence

Always use `SettingsManager` methods — never write to Redis directly in a node.

```python
await self.request_context.settings_manager.save_setting(SettingsKeys.widgets, [widget])
await self.request_context.settings_manager.delete_setting(SettingsKeys.plugins, [plugin_id])
```

`publish_change()` is called automatically inside `save_setting` and `delete_setting` — do not call it manually.

---

## Logging

One logger per module, created at module level:

```python
import logging
logger = logging.getLogger(__name__)
```

- Use `logger.debug` for verbose tracing (HTTP calls, parsed values).
- Use `logger.info` for significant events (plugin loaded, config applied).
- Use `logger.error` + `traceback.format_exc()` for caught exceptions that shouldn't crash the request.
- Never use `print`.

---

## Error Handling

- Raise domain-specific exceptions (`CannotParseNumber`, `SelectorNotFoundInTree`, `CalledProcessorError`) rather than bare `Exception` or `ValueError`.
- In nodes, use `ValidationError` (from `node_base`) to return an error result without raising — this allows returning structured error types to the client.
- Let unexpected errors propagate; Starlette will catch them and return a 500.

---

## HTTP Fetching

Use `Fetcher` for simple GET requests that return HTML/XML/JSON. Use `httpx.AsyncClient` directly only when you need custom headers, method, or session behaviour (e.g. `RequestCacheNode`).

---

## File Organisation

- One node per file under `claude/api/nodes/`. Group related nodes in a sub-package (e.g. `nodes/weather/`).
- Components live in `claude/components/`. Stateless utilities go in `tools.py`. Domain logic gets its own sub-package with `types.py` + implementation file.
- Never import from `claude.api` inside `claude.components` — components must not depend on the API layer.

---

## Comments

Write a comment only when the **why** is non-obvious — a hidden constraint, a workaround, a subtle invariant. A docstring with examples is acceptable for pure utility functions (see `parse_number` with doctests). Do not describe what the code does — the code does that.

```python
# good: explains a non-obvious constraint
# Re-load from disk on every call to support hot-reload without server restart.

# bad: restates the code
# Set the key in redis
await redis.set(key, data)
```

---

## Tests

Tests live in `claude/tests/unit/`. Use `pytest` and `pytest-asyncio`. Test pure logic and utility functions; avoid testing Graphene resolvers through the full HTTP stack (that belongs in integration tests). Doctests are acceptable for small pure functions.
