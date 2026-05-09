# Claude

Self-hosted browser-based dashboard with configurable widgets. Python/Starlette backend, React/TypeScript frontend, Redis for persistence.

## Documentation

### Architecture

> **MANDATORY: You MUST read the relevant architecture docs before planning or proposing any change. Do not skip this step. Starting without reading is an error.**

If unsure which subsystem is involved, start with the overview and follow the links.

| File | When to read |
|---|---|
| [docs/architecture/overview.md](docs/architecture/overview.md) | Start here — stack, runtime topology, all data flows |
| [docs/architecture/backend.md](docs/architecture/backend.md) | Any backend change — app structure, middleware, NodeBase pattern, DI |
| [docs/architecture/frontend.md](docs/architecture/frontend.md) | Any frontend change — component tree, widget system, context providers |
| [docs/architecture/data-model.md](docs/architecture/data-model.md) | Settings entities, Redis key schema, pub/sub sync |
| [docs/architecture/graphql-api.md](docs/architecture/graphql-api.md) | Adding or changing queries, mutations, or subscriptions |
| [docs/architecture/plugin-system.md](docs/architecture/plugin-system.md) | Anything touching plugins or the weather provider interface |
| [docs/architecture/home-assistant.md](docs/architecture/home-assistant.md) | Any HA widget or WebSocket integration work |

### Coding Guidelines

> **MANDATORY: You MUST read the relevant guideline file before writing or modifying any code. The guidelines are not optional — they describe the established patterns of this codebase and must be followed.**

| File | When to read |
|---|---|
| [docs/guidelines/backend.md](docs/guidelines/backend.md) | Any Python change |
| [docs/guidelines/frontend.md](docs/guidelines/frontend.md) | Any TypeScript/React change |

## Development

```bash
# Backend
poetry install
export CLAUDE_CONFIG_FILE=/path/to/config.yaml
invoke backend.run

# Frontend
npm install
npm run dev

# List all tasks
invoke --list
```

### Config file (YAML)

```yaml
redis: redis://localhost:6379/1
plugins_folder: /path/to/plugins
```

## Key Conventions (quick reference)

**Backend**
- Every GraphQL resolver is a `NodeBase` subclass with `config = NodeConfig(...)`.
- All data shapes are Pydantic models — never raw dicts across boundaries.
- Access Redis/settings/plugins through `self.request_context` only.
- Use `object_type_from_pydantic()` for GraphQL output types — never hand-write `ObjectType` classes for data.

**Frontend**
- Every widget: `useRnd` first → `<RndFrame>` root → `<WidgetMenu>` last child.
- Settings class extends `BaseWidgetSettings` with typed defaults for every field.
- Register new widgets in `frontend/components/widget-registry.ts`.
- All GraphQL operations are in `frontend/queries.graphql`; run `npm run codegen` after changes.
- Styling via MUI `sx` prop only — no CSS files.
