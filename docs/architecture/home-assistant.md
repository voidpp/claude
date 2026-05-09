# Home Assistant Integration

## Overview

Claude integrates with [Home Assistant](https://www.home-assistant.io/) to display live sensor data, calendar events, and device states in widgets. Unlike most backend integrations, the HA connection runs **entirely in the browser** — the frontend maintains a direct WebSocket connection to the HA server. The backend is only involved in storing the HA server URL and API token.

## Configuration

The HA server is configured in **Admin → Home Assistant**:

- **Enabled** — toggle the connection on/off.
- **URL** — HTTP URL of the HA instance (e.g. `http://homeassistant.local:8123`).
- **API Token** — a [Long-Lived Access Token](https://www.home-assistant.io/docs/authentication/#long-lived-access-tokens) from the HA user profile.

Configuration is stored in Redis under `claude_settings_home_assistant_server` and synced to all browsers via the GraphQL subscription.

## WebSocket Connection (`frontend/home-assistant/`)

### Provider

`websocket-context-provider.tsx` implements `HASSWebsocketProvider`. It:

1. Reads `settings.homeAssistantServer` from `AppSettingsContext`.
2. When `enabled` is true and at least one widget has subscribed, opens a `ReconnectingWebSocket` to `{url.replace("http", "ws")}/api/websocket`.
3. Authenticates using the [HA WebSocket authentication protocol](https://developers.home-assistant.io/docs/api/websocket/#authentication):
   - Receives `auth_required`
   - Sends `{ type: "auth", access_token: "..." }`
   - Receives `auth_ok`
4. After auth, enables message coalescing (`supported_features: { coalesce_messages: 1 }`) and subscribes to all `state_changed` events.
5. Dispatches incoming events to per-entity listener lists.

The WebSocket is torn down and recreated whenever the HA server settings change.

### Context

`websocket-context.ts` defines `hassWebsocketContext`:

```ts
type HASSWebsocketContextData = {
  subscribe: (entityIdList: string[], onEvent: HASSStateChangeListener) => void;
  unsubscribe: (onEvent: HASSStateChangeListener) => void;
};
```

Widgets call `subscribe` on mount and `unsubscribe` on unmount. The provider maintains a `Map<entityId, listener[]>` and dispatches events only to listeners interested in the changed entity.

### Hooks

`websocket-hooks.ts` provides `useHASSEntityState(entityId)` — a hook that subscribes to a single entity and returns its current state, updated on every `state_changed` event.

## HA-Specific Widgets

### HAEntityList (`ha-entity-list.tsx`)
Displays a configurable list of HA entity states. Supports custom number formatting per entity. Subscribes to the listed entity IDs and re-renders on state change.

### HAGauge (`ha-gauge.tsx`)
Displays a single HA numeric entity as a gauge (arc chart). Supports custom min/max, unit, and number format. Added a custom number format option in a recent commit.

### HAGoogleCalendarEvents (`ha-google-calendar-events.tsx`)
Displays upcoming events from a Google Calendar exposed through Home Assistant. Uses REST API calls through `use-google-calendar-event-list.ts` rather than the WebSocket.

### HACSBambuLabPrintProgress (`hacs-bl-print-progress.tsx`)
Displays Bambu Lab 3D printer state (print progress, layer, remaining time, etc.) via HACS integration entities. Handles the `offline` state gracefully (added in a recent fix). Subscribes to multiple printer-related entity IDs.

## Message Flow

```
HA Server
  │  state_changed event (WebSocket)
  ▼
HASSWebsocketProvider
  │  parses JSON, supports batched message arrays
  │  looks up entityId in listener map
  ▼
Widget listener callback
  │  updates local React state
  ▼
Widget re-renders with new value
```

## Google Calendar (REST)

`use-google-calendar-list.ts` and `use-google-calendar-event-list.ts` query the HA REST API (not WebSocket) to list calendars and fetch events. These use the `requestCache` GraphQL query so that requests are proxied through the backend and cached in Redis, avoiding CORS issues and reducing redundant API calls.
