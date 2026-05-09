# GraphQL API Reference

The API is served at `/api/`. GraphiQL explorer is available at `GET /api/` in development.

## Queries

### `ping`
```graphql
ping: String
```
Returns `"pong"`. Used for connectivity checks.

---

### `version`
```graphql
version: String
```
Returns the current application version string.

---

### `settings`
```graphql
settings: Settings
```
Returns the current application settings. Only the fields present in the query are fetched from Redis (field-selection-aware).

```graphql
type Settings {
  dashboards: [Dashboard]
  widgets: [Widget]
  plugins: [Plugin]
  specialDays: [SpecialDay]
  freeCurrencyApiAccounts: [FreeCurrencyApiAccount]
  homeAssistantServer: HomeAssistantServer
}
```

---

### `weather`
Nested weather queries, resolved by the active weather plugin.

```graphql
weather {
  current(city: String!, pluginId: String!): CurrentWeather
  days(city: String!, pluginId: String!): [DayForecast]
  hours(city: String!, pluginId: String!): [HourForecast]
}

type CurrentWeather {
  image: String
  temperature: Int
}

type DayForecast {
  day: Int
  date: String
  image: String
  temperature: { min: Int, max: Int }
  precipitation: { value: Int, probability: Int }
}

type HourForecast {
  hour: Int
  image: String
  temperature: Float
  precipitation: { value: Int, probability: Int }
}
```

Weather nodes use `NodeBase` caching — results are cached in Redis for a configurable TTL to avoid hammering external APIs.

---

### `serverStatus`
```graphql
serverStatus(ip: String!, port: Int): ServerStatus
```
Pings the given IP (4× ICMP, 0.2s interval) and optionally fetches `http://{ip}:{port}/` for server metadata.

---

### `sunriseSunset`
```graphql
sunriseSunset(lat: Float!, lon: Float!): SunriseSunset
```
Returns today's sunrise and sunset times for the given coordinates, fetched from an external API.

---

### `requestCache`
```graphql
requestCache(
  url: String!
  cacheSeconds: Int!
  method: String        # default "GET"
  headers: [Header]
): RequestCacheResult

type RequestCacheResult {
  content: String   # raw response body
  code: Int         # HTTP status code
}
```
General-purpose HTTP proxy with Redis caching. Used by widgets that need to fetch external data (e.g. HA REST API) while avoiding CORS issues and reducing API calls.

---

### `pluginData`
```graphql
pluginData(id: String!): PluginData

type PluginData {
  metadata: Plugin
  content: String     # raw Python source of the plugin file
}
```
Used by the admin plugin editor to load an existing plugin for editing.

---

## Mutations

### Dashboard
```graphql
saveDashboard(data: DashboardInput!): Boolean
removeDashboard(id: String!): Boolean
```

### Widget
```graphql
saveWidget(data: WidgetInput!): Boolean
removeWidget(id: String!): Boolean
```
Widget `settings` field is a JSON string — serialized by the client before sending, deserialized by the client after receiving.

### Plugin
```graphql
savePlugin(
  id: String!
  file: String!       # Python source code
  name: String!
  type: PluginType!
  className: String!
): SavePluginResult

type SavePluginResult {
  error: String       # null on success, error message on failure
}

removePlugin(id: String!): Boolean
```
`savePlugin` validates the plugin by attempting to import it before persisting. If the class cannot be loaded, an error is returned without saving.

### Special Days
```graphql
saveSpecialDays(days: [SpecialDayInput!]!): Boolean
removeSpeicalDays(days: [SpecialDayIdInput!]!): Boolean
```

### Currency API Accounts
```graphql
saveFreeCurrencyApiAccount(data: FreeCurrencyApiAccountInput!): Boolean
removeFreeCurrencyApiAccount(id: String!): Boolean
```

### Home Assistant Server
```graphql
saveHomeAssistantServer(data: HomeAssistantServerInput): Boolean
```

---

## Subscriptions

### `settings`
```graphql
subscription {
  settings {
    dashboards { ... }
    widgets { ... }
    # any subset of settings fields
  }
}
```
Pushes updated settings to the client whenever any mutation changes settings in Redis. The resolver subscribes to the Redis pub/sub channel and re-fetches only the fields included in the subscription query's selection set.

This is the primary mechanism for keeping all connected browsers in sync.

---

## Type Definitions (key types)

```graphql
type Dashboard {
  id: ID!
  name: String!
  stepSize: Int!
  background: String!
  theme: String!
  locale: String!
}

type Widget {
  id: ID!
  dashboardId: ID!
  type: String!
  x: Int!
  y: Int!
  width: Int!
  height: Int!
  settings: String!   # JSON
}

type Plugin {
  id: ID!
  name: String!
  type: PluginType!
  className: String!
}

enum PluginType {
  WEATHER
}

type SpecialDay {
  date: String!
  locale: String!
  type: SpecialDayType!
}

enum SpecialDayType {
  NON_WORKING_DAY
  RELOCATED_REST_DAY
  RELOCATED_WORKING_DAY
}

type HomeAssistantServer {
  enabled: Boolean!
  url: String!
  apiToken: String!
}
```

## Code Generation

TypeScript types and React hooks are auto-generated from `frontend/queries.graphql` using GraphQL Code Generator (`codegen.ts`). Run `npm run codegen` to regenerate after schema or query changes.
