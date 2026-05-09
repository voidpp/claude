# Architecture Summary: Claude Dashboard

**Claude** is a self-hosted, browser-based dashboard application (v0.9.2) for displaying configurable widgets — weather, server status, Home Assistant sensors, currency rates, Bambu Lab print progress, and more.

> This is a high-level summary. Detailed documentation is in [docs/architecture/](docs/architecture/):
>
> | File | Contents |
> |---|---|
> | [overview.md](docs/architecture/overview.md) | Full stack table, runtime topology diagram, all data flows, env vars |
> | [backend.md](docs/architecture/backend.md) | App structure, middleware stack, NodeBase resolver pattern, DI system |
> | [frontend.md](docs/architecture/frontend.md) | Component tree, widget system, context providers, build pipeline |
> | [data-model.md](docs/architecture/data-model.md) | Pydantic models, Redis key schema, pub/sub sync |
> | [graphql-api.md](docs/architecture/graphql-api.md) | All queries, mutations, subscriptions with types |
> | [plugin-system.md](docs/architecture/plugin-system.md) | Plugin lifecycle, WeatherProvider interface |
> | [home-assistant.md](docs/architecture/home-assistant.md) | WebSocket auth flow, HA widgets, Google Calendar |

---

## Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.10+, Starlette (ASGI), Graphene 3 (GraphQL) |
| Frontend | React + TypeScript, Vite, Apollo Client |
| Persistence | Redis (all settings stored as JSON keys) |
| Realtime | GraphQL Subscriptions over WebSocket (settings changes) + HASS WebSocket |
| Build/tasks | Invoke (Python), Poetry, npm |

---

## Backend (`claude/`)

```
claude/
├── app.py              # Starlette app factory, wires all components
├── api/
│   ├── schema.py       # GraphQL schema (Query + Mutation + Subscription)
│   ├── queries.py      # Weather, server status, settings, sunrise/sunset, plugins
│   ├── mutations.py    # Save/remove dashboards, widgets, plugins, special days, HA server
│   ├── subscriptions.py# Redis pub/sub → settings change stream
│   └── nodes/          # One file per GraphQL node/resolver
├── components/
│   ├── config.py       # YAML config loader (redis URL, plugins_folder)
│   ├── settings/
│   │   ├── types.py    # Pydantic models: Dashboard, Widget, Plugin, SpecialDay, …
│   │   └── manager.py  # SettingsManager — Redis CRUD + pub/sub publish
│   ├── plugins.py      # PluginManager — dynamic Python class loader from disk
│   ├── request_context.py # DI container injected per-request via middleware
│   ├── weather/        # Weather data plugin interface
│   └── server_status/  # Server/storage status fetcher
└── env.py              # Env var config (CLAUDE_CONFIG_FILE, dev mode)
```

**Key patterns:**
- **Dependency Injection**: `InjectionMiddleware` injects a `RequestContext` (Redis, config, settings manager, plugin manager) into every request scope.
- **Settings persistence**: All settings (dashboards, widgets, plugins, etc.) stored as Redis keys under `claude_settings_*`. Changes are broadcast via Redis pub/sub channel, triggering GraphQL subscription updates to all connected clients.
- **Plugin system**: Weather plugins are Python classes stored as `.py` files on disk, dynamically loaded via `importlib` by `PluginManager`.

---

## Frontend (`frontend/`)

```
frontend/
├── components/
│   ├── app.tsx             # Root: layout, dashboard switching
│   ├── dashboard.tsx       # Renders positioned widgets (drag-and-drop via rnd.tsx)
│   ├── widget-registry.ts  # Central map: widget type → component + settings class
│   └── widgets/            # One file (or folder) per widget type
│       ├── clock, calendar, day-counter, gallery, currencies, …
│       ├── weather/ (current, days, hours)
│       ├── server-status, storage-status, sunrise-sunset
│       ├── influx-table, buck
│       └── home-assistant/ (ha-entity-list, ha-gauge, ha-google-calendar-events, hacs-bl-print-progress)
├── admin/                  # Admin UI: manage dashboards, widgets, plugins, special days, currency accounts
├── home-assistant/
│   ├── websocket-context.ts    # React context for HASS WebSocket connection
│   ├── websocket-context-provider.tsx
│   └── websocket-hooks.ts      # Hooks for subscribing to entity state changes
├── queries.graphql         # All GQL queries/mutations/subscriptions
├── client.ts               # Apollo Client setup
└── translations/           # i18n: en, hu
```

**Key patterns:**
- **Widget registry**: `widget-registry.ts` maps string type keys to React components and their settings schemas — the entire widget system is driven from this registry.
- **Settings sync**: Apollo Client subscribes to `settings` GraphQL subscription; any backend change (from any client) is instantly pushed to all browsers.
- **Home Assistant**: A dedicated WebSocket client connects directly from the browser to the HA server. Widgets subscribe to specific entity IDs via React context.
- **Drag-and-drop layout**: Widgets are freely positioned/resized via `react-rnd`, with position/size persisted in Redis.

---

## Data Flow

```
Browser
  │
  ├── Apollo GraphQL (HTTP + WS) ──→ Starlette /api ──→ Graphene schema
  │                                                         │
  │                                                    Redis (settings)
  │                                                         │
  │   ←── GraphQL Subscription (settings changed) ──────────┘
  │
  └── HASS WebSocket ──→ Home Assistant server (direct browser connection)
```

---

## External Integrations

- **Home Assistant**: WebSocket API, direct from browser
- **Weather**: Plugin-based (custom Python classes loaded from disk)
- **Currency rates**: FreeCurrencyAPI (API key stored in settings)
- **InfluxDB**: Query-based widget (buck)
- **Sunrise/Sunset**: External API via backend fetcher
