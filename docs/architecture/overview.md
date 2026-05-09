# System Overview

## What Is Claude?

Claude is a self-hosted dashboard application (v0.9.2, MIT license). Users compose dashboards from freely drag-and-drop-positionable widgets that show live data: weather forecasts, server health, Home Assistant sensor states, currency exchange rates, calendar events, Bambu Lab print progress, and more. All configuration is persisted in Redis and synchronized in real time to every connected browser.

## Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Backend language | Python | 3.10+ |
| ASGI framework | Starlette | ^0.21 |
| GraphQL engine | Graphene 3 + starlette-graphene3 | ^3.1 |
| Data validation | Pydantic v2 | ^2.11 |
| HTTP server | Uvicorn (standard extras) | ^0.18 |
| HTTP client | httpx | ^0.23 |
| Persistence | Redis (async via `redis[asyncio]`) | ^4.5 |
| Serialization | orjson | ^3.8 |
| Frontend framework | React 18 + TypeScript | — |
| Build tool | Vite | — |
| GraphQL client | Apollo Client | — |
| UI components | MUI (Material UI) | — |
| Widget layout | react-rnd | — |
| Task runner | Invoke (Python) | ^2.0 |
| Package managers | Poetry (backend), npm (frontend) | — |

## Runtime Topology

```
┌──────────────────────────────────────────────────────────────────┐
│  Browser                                                          │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  React SPA                                                   │ │
│  │                                                              │ │
│  │  Apollo Client ──HTTP──────────────────────────────────────┐ │ │
│  │              ──WebSocket (subscriptions)──────────────────┐ │ │ │
│  │                                                            │ │ │ │
│  │  ReconnectingWebSocket ─── Home Assistant WebSocket API   │ │ │ │
│  └──────────────────────────────────────────────────────────│─│─┘ │
└─────────────────────────────────────────────────────────────│─│───┘
                                                              │ │
                          ┌───────────────────────────────────┘ │
                          │                                      │
┌─────────────────────────▼──────────────────────────────────────▼──┐
│  Starlette (Uvicorn)                                               │
│                                                                    │
│  /static   StaticFiles                                             │
│  /assets   StaticFiles                                             │
│  /api      GraphQLApp (Graphene 3)  ◄── Query / Mutation           │
│                                     ◄── Subscription (WebSocket)   │
│  /*        index.html (SPA fallback)                               │
│                                                                    │
│  InjectionMiddleware → RequestContext (DI container)               │
│  CORSMiddleware                                                     │
└─────────────────────────────────────────────────────────────────┬──┘
                                                                   │
                                                    ┌──────────────▼──────────────┐
                                                    │  Redis                       │
                                                    │  - Settings keys (JSON)      │
                                                    │  - Response cache            │
                                                    │  - Pub/sub channel           │
                                                    └──────────────────────────────┘
```

## Request / Data Flows

### Settings read (query)
1. Browser sends GraphQL query over HTTP.
2. Starlette routes to `GraphQLApp`.
3. `InjectionMiddleware` makes `RequestContext` available on the ASGI scope.
4. Graphene resolves `Query.settings` → `SettingsNode`.
5. `SettingsNode` fetches only the Redis keys referenced by the query's field selection.
6. JSON is deserialized into Pydantic models and returned as GraphQL types.

### Settings write (mutation)
1. Browser sends GraphQL mutation over HTTP.
2. Resolver validates input with a Pydantic model.
3. `SettingsManager.save_setting()` writes to Redis and publishes to the `settings_changed` pub/sub channel.
4. All active subscription connections receive the update and send fresh data to every connected browser.

### Realtime settings sync (subscription)
1. Browser opens a persistent WebSocket to `/api/`.
2. Apollo Client routes subscription operations through `WebSocketLink`.
3. `Subscription.settings` resolver subscribes to the Redis pub/sub channel.
4. On each publish, it re-fetches the relevant settings keys and yields the result.
5. All browsers receive consistent state without polling.

### Cached external data (requestCache query)
1. Widget queries `requestCache(url, cacheSeconds, ...)`.
2. Backend checks Redis for a cached response keyed by base64(args JSON).
3. On miss, fetches the URL with httpx, stores the result, and returns it.
4. Subsequent requests within `cacheSeconds` return the cached value.

## Environment Variables

| Variable | Purpose |
|---|---|
| `CLAUDE_CONFIG_FILE` | Path to the YAML config file (required) |
| `CLAUDE_DEV_MODE` | Enables Starlette debug mode (`true`/`false`) |

## Config File (YAML)

```yaml
redis: redis://localhost:6379/1   # Redis connection URL
plugins_folder: /path/to/plugins  # Directory for plugin .py files
```
