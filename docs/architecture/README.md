# Architecture Documentation

Claude is a self-hosted, browser-based dashboard application for displaying configurable, freely-positioned widgets. This folder contains detailed architecture documentation.

## Documents

| File | Contents |
|---|---|
| [overview.md](overview.md) | High-level system overview, stack, and data flow |
| [backend.md](backend.md) | Python backend — Starlette app, GraphQL API, components |
| [frontend.md](frontend.md) | React frontend — app structure, widget system, context providers |
| [data-model.md](data-model.md) | Settings data model, Redis persistence, pub/sub |
| [plugin-system.md](plugin-system.md) | Plugin architecture for extensible weather providers |
| [home-assistant.md](home-assistant.md) | Home Assistant WebSocket integration |
| [graphql-api.md](graphql-api.md) | Full GraphQL schema reference (queries, mutations, subscriptions) |
