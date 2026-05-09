# Frontend Architecture

## Overview

The frontend is a React 18 + TypeScript single-page application built with Vite. It communicates with the backend exclusively through GraphQL (Apollo Client), uses MUI for UI components, and keeps widget layout state in Redux/local state driven by real-time GraphQL subscriptions.

## Directory Structure

```
frontend/
├── index.tsx               # React root mount
├── client.ts               # Apollo Client factory
├── config.tsx              # AppConfig context (selected dashboard, local storage)
├── settings.ts             # AppSettings context (live settings + mutation helpers)
├── hooks.ts                # Shared React hooks
├── tools.ts                # Utility functions
├── types.ts                # Shared TypeScript types (BaseWidgetSettings, WidgetConfig, …)
├── widgets.tsx             # Context provider factory helper
├── notifications.tsx       # Notification context
├── countries.ts            # Country data
├── currencies.json         # Currency metadata
│
├── components/
│   ├── app.tsx             # Provider tree root
│   ├── main-frame.tsx      # Top-level layout + React Router routes
│   ├── dashboard.tsx       # Widget rendering loop
│   ├── control-bar.tsx     # Dashboard switcher toolbar
│   ├── rnd.tsx             # react-rnd wrapper (drag, resize, persist)
│   ├── connection-indicator.tsx
│   ├── add-widget-button.tsx
│   ├── dashboard-button.tsx
│   ├── dashboard-form-dialog.tsx
│   ├── widget-menu.tsx     # Per-widget context menu (edit, delete)
│   ├── widget-registry.ts  # Central widget type map
│   ├── theme.ts            # MUI theme
│   ├── tranlations.tsx     # i18n provider
│   │
│   ├── calendar/           # Calendar utility functions + tests
│   │
│   ├── widget-settings/
│   │   ├── widget-settings-dialog.tsx  # Generic settings form dialog
│   │   ├── field-generator.tsx         # Auto-generates form fields from settings class
│   │   ├── duration-field.tsx
│   │   ├── list-field.tsx
│   │   └── types.ts
│   │
│   └── widgets/            # One file/folder per widget type
│       ├── buck/           # InfluxDB query widget
│       ├── calendar.tsx
│       ├── clock.tsx
│       ├── currencies.tsx
│       ├── day-counter.tsx
│       ├── gallery.tsx
│       ├── influx-table.tsx
│       ├── server-status.tsx
│       ├── storage-status.tsx
│       ├── sunrise-sunset.tsx
│       ├── weather/
│       │   ├── current.tsx
│       │   ├── days.tsx
│       │   └── hours.tsx
│       └── home-assistant/
│           ├── ha-entity-list.tsx
│           ├── ha-gauge.tsx
│           ├── ha-google-calendar-events.tsx
│           └── hacs-bl-print-progress.tsx
│
├── home-assistant/
│   ├── websocket-context.ts          # Context type definitions + createContext
│   ├── websocket-context-provider.tsx # ReconnectingWebSocket + auth + dispatch
│   ├── websocket-hooks.ts            # useHASSEntityState hook
│   ├── client.ts                     # HA REST API helpers
│   ├── keys.ts                       # HA entity key constants
│   ├── use-google-calendar-event-list.ts
│   └── use-google-calendar-list.ts
│
└── translations/
    ├── index.ts
    ├── en.ts
    └── hu.ts
```

## Context Provider Tree

`app.tsx` wraps the entire application in a nested provider tree (outermost first):

```
ApolloProvider            — GraphQL client
  QueryClientProvider     — React Query (for REST calls)
    ThemeProvider         — MUI theme
      AppConfigContextProvider    — local-storage state (selected dashboard, app version)
        AppSettingsContextProvider — live settings from GraphQL subscription + mutations
          Tranlations             — i18n (react-intl)
            NotificationContextProvider
              HASSWebsocketProvider  — Home Assistant WebSocket connection
                MainFrame            — routes + layout
```

## Routing

`main-frame.tsx` uses React Router. Routes:

| Path | Component |
|---|---|
| `/` | `Dashboard` — the live widget board |
| `/admin/*` | `Admin` — configuration panel |
| `/admin/plugins` | Plugin management (upload Python file) |
| `/admin/dashboards` | Dashboard CRUD |
| `/admin/free-currency-api-accounts` | Currency API key management |
| `/admin/special-days` | Calendar special day management |
| `/admin/housekeeping` | Cache management |
| `/admin/home-assistant` | HA server configuration |

## Apollo Client

`client.ts` creates a single Apollo Client instance shared across the app:

- **HTTP link** — standard `HttpLink` for queries and mutations.
- **WebSocket link** — `WebSocketLink` (via `SubscriptionClient` from `subscriptions-transport-ws`) for subscriptions.
- **Split link** — routes operations: subscriptions → WebSocket, everything else → HTTP.
- In production, API URL is derived from `window.location.origin`; in dev, from `VITE_API_*` env vars.

```
Query / Mutation  ──► HttpLink  ──► /api/
Subscription      ──► WebSocketLink ──► ws[s]://host/api/
```

## AppSettings Context

`settings.ts` is the central settings manager on the frontend:

- Subscribes to `liveSessions` GraphQL subscription (`useLiveSettingsSubscription`).
- Stores the latest settings payload in local React state.
- Exposes typed async helpers for every mutation: `saveWidget`, `savePlugin`, `saveDashboard`, `removeWidget`, etc.
- Widget settings are serialized to/from JSON string at the boundary: `JSON.stringify(data.settings)` on save, `JSON.parse(widget.settings)` on load.

## Widget System

### Registry

`widget-registry.ts` exports `widgetRegistry` — a plain object map from widget type key (string) to:

```ts
type WidgetRegistryEntry = {
  factory: (props: any) => JSX.Element;    // React component
  settingsType: typeof BaseWidgetSettings; // Settings class (for defaults + form generation)
  defaultSize: { w: number; h: number };   // Initial dimensions when adding a widget
};
```

Currently registered widget types:

| Key | Widget |
|---|---|
| `buck` | InfluxDB query table |
| `calendar` | Monthly calendar |
| `clock` | Digital/analog clock |
| `dayCounter` | Days-until/since counter |
| `gallery` | Image slideshow |
| `influxTable` | InfluxDB data table |
| `currentWeather` | Current weather conditions |
| `currencies` | Exchange rates |
| `daysWeather` | Multi-day weather forecast |
| `hoursWeather` | Hourly weather forecast |
| `serverStatus` | Server ping + HTTP status |
| `sunriseSunset` | Sunrise/sunset times |
| `storageStatus` | Disk usage |
| `googleCalendar` | Google Calendar events (via HA) |
| `hacsBambuLabPrintProgress` | Bambu Lab 3D printer progress (via HACS) |
| `haGauge` | Home Assistant entity gauge |
| `haEntityList` | Home Assistant entity state list |

### Settings Classes

Every widget defines a `*Settings` class extending `BaseWidgetSettings`:

```ts
class BaseWidgetSettings {
  load(data: Record<string, unknown>) {
    // copies known keys from raw JSON into typed properties
  }
}
```

Widget settings are stored as a JSON string in the `Widget.settings` Redis key. On load, the dashboard instantiates the correct settings class from the registry and calls `.load(JSON.parse(widget.settings))`.

### Settings Form

`widget-settings/field-generator.tsx` auto-generates a MUI form from a settings class instance by reflecting over its properties. Field types are inferred from the property value type; special field types (duration, list) are handled by dedicated sub-components (`duration-field.tsx`, `list-field.tsx`).

### Drag-and-Drop Layout

`rnd.tsx` wraps `react-rnd`. Each widget's position (`x`, `y`) and size (`width`, `height`) are stored in the `Widget` Redis record. On drag stop or resize stop, the component calls `saveWidget` mutation to persist the new geometry.

## Build Pipeline

Vite builds the frontend to `frontend-dist/`, then a post-build plugin copies the output to `claude/static/` so it is served as static files by the backend. The backend always serves `claude/static/index.html` for any non-API route, enabling client-side routing.

In development, Vite's dev server proxies `/static` to the backend via `VITE_API_*` env vars.
