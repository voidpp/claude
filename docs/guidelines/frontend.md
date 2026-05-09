# Frontend Coding Guidelines

## Formatting

- Prettier enforces formatting automatically. Run it before committing.
- Use the `@/` path alias for imports from the frontend root — never use relative `../../` more than one level up.

```ts
// good
import { useAppSettings } from "@/settings";
import { BaseWidgetSettings } from "@/types";

// bad
import { useAppSettings } from "../../settings";
```

---

## React Imports

Always use the namespace import form:

```ts
import * as React from "react";
```

Named hooks (`useState`, `useEffect`, `useMemo`, `useRef`, `useContext`, `createContext`) are imported separately from `react`:

```ts
import { useState, useEffect, useMemo } from "react";
```

---

## Component Style

- Use **named function arrow components** (`export const Foo = () => ...`), not function declarations.
- Export the component and its settings class from the same file.
- Props type is always a named alias: `export type FooProps = CommonWidgetProps<FooSettings>`.

```tsx
export class FooSettings extends BaseWidgetSettings {
  title: string = "";
  count: number = 10;
}

export type FooProps = CommonWidgetProps<FooSettings>;

export const Foo = (props: FooProps) => {
  const { config } = props;
  ...
};
```

---

## Widget Anatomy

Every widget follows the same structure. Do not deviate from it.

```tsx
export const MyWidget = (props: MyWidgetProps) => {
  const { config } = props;
  const rndProps = useRnd(config);     // 1. always first

  // 2. data hooks
  const { data } = useSomeQuery(...);

  // 3. derived state with useMemo
  const computed = useMemo(() => ..., [deps]);

  return (
    <RndFrame rndProps={rndProps}>    {/* 4. always the root element */}
      {/* widget content */}
      <WidgetMenu                     {/* 5. always the last child */}
        id={config.id}
        settings={config.settings}
        settingsFormFields={[...]}
      />
    </RndFrame>
  );
};
```

- `useRnd(config)` is always the first hook call.
- `<RndFrame rndProps={rndProps}>` is always the root element.
- `<WidgetMenu>` is always the last child of `<RndFrame>`.
- Set `defaultOpen={!config.settings.someRequiredField}` so the settings dialog opens automatically when a widget is freshly added and has no configuration yet.

---

## Widget Settings Class

Extend `BaseWidgetSettings`. Every field must have a typed default value — no optional fields without a default.

```ts
export class ClockSettings extends BaseWidgetSettings {
  showDate: boolean = true;
  timeFormat: string = "HH:mm";
  dateFormat: string = "YYYY. MMMM D. dddd";
  timeYPosition: number = 0;
}
```

The `load()` method from `BaseWidgetSettings` hydrates the instance from raw JSON by copying known keys — this works automatically as long as field names match the stored JSON keys.

---

## Widget Registration

After creating a new widget, add it to `widget-registry.ts`. The key is camelCase and becomes the `type` stored in Redis.

```ts
export const widgetRegistry = {
  myWidget: {
    factory: MyWidget,
    settingsType: MyWidgetSettings,
    defaultSize: { w: 400, h: 200 },
  },
  ...
} satisfies Record<string, WidgetRegistryEntry>;
```

The `satisfies` constraint is mandatory — it catches missing or mistyped entries at compile time.

---

## Settings Form Fields

`settingsFormFields` is declared **inline** inside the component, directly on `<WidgetMenu>`. Keep field descriptors as simple data objects — no logic, no conditionals inside the array.

```tsx
settingsFormFields={[
  { name: "city", label: "City" },
  { name: "pollInterval", label: "Refresh interval", type: "duration" },
  { name: "showCity", label: "Show city name" },
  {
    name: "providerId",
    label: "Provider",
    type: "select",
    options: providerOptions,
  } as FormSelectFieldDescriptor,
]}
```

Type narrowing with `as FormSelectFieldDescriptor` (or other descriptor subtypes) is expected and acceptable for field descriptors that have extra properties.

Field type inference rules:
- `boolean` property → type inferred as `boolean` by the field generator
- `number` property → type inferred as `number`
- `string` property → defaults to `string` (text input)
- Explicitly set `type: "select"`, `type: "duration"`, `type: "list"`, etc. for complex fields

---

## Styling

Use MUI's `sx` prop for all styling. No separate CSS files, no `styled()` components.

**One-off styles** go inline on the element:

```tsx
<Box sx={{ textAlign: "center", fontSize: width * 0.3 }}>
```

**Reused styles** are named `SxProps` objects declared at **module scope** (outside the component), using `satisfies`:

```ts
const styles = {
  body: {
    borderRadius: 2,
    backdropFilter: "blur(3px)",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  header: {
    fontSize: "1.2em",
    fontWeight: "bold",
    textAlign: "center",
  },
} satisfies Record<string, SxProps<Theme>>;
```

Size-dependent styles (font sizes relative to widget dimensions) are computed inline or via a small getter function:

```ts
const getTimeStyle = (height: number): SxProps => ({
  fontSize: height * 0.8,
  textAlign: "center",
});
```

---

## State Management

- **Live settings** come from `useAppSettings()` — the GraphQL subscription keeps this in sync across all clients automatically. Never duplicate settings state locally.
- **Local widget state** (current time, fetched data refresh) uses `useState` + `useInterval` or Apollo's `refetch`.
- **Derived state** from props/settings uses `useMemo`. Do not recompute expensive derivations in the render body without memoization.
- **Selected dashboard** and other app-level UI state is in `useAppConfig()` (backed by localStorage).

---

## Hooks

- Hooks live in `hooks.ts` if they are shared across multiple components.
- Widget-local hooks (e.g. a subscription hook used by one widget) stay in the widget file.
- Hook naming: `use` + noun or noun phrase (`useCurrentDashboard`, `usePluginOptions`, `useBoolState`).
- `useBoolState` returns `[value, setTrue, setFalse, toggle]` — use it instead of `useState<boolean>` when you need discrete set/toggle helpers.

---

## GraphQL

All queries, mutations, and subscriptions are defined in `queries.graphql`. Never write inline `gql` tag calls in component files. After changing `queries.graphql`, run `npm run codegen` to regenerate `graphql-types-and-hooks.ts`.

Import generated hooks directly:

```ts
import { useCurrentWeatherQuery } from "@/graphql-types-and-hooks";
```

Use `fetchPolicy: "cache-and-network"` for queries that should stay fresh. Use `"standby"` to skip a query when required config is missing (e.g. no `providerId` selected yet).

---

## Home Assistant Widgets

Widgets that read HA entity state follow this pattern:

```tsx
const value = useHAStateSubscription(config.settings.entityName);      // single entity
const states = useHAStatesSubscription(entityIdList);                  // multiple entities
```

These hooks subscribe to the shared HA WebSocket connection — they do not open their own socket. Always unsubscribe on unmount (the hook handles this).

For initial state (before the first WebSocket event), fetch from the HA REST API using `useHomeAssistantStatesEx()` or `useHomeAssistantNumericStates()`.

---

## Date & Time

Use `dayjs` for all date/time formatting and manipulation. Import locale data when formatting locale-aware dates:

```ts
dayjs().locale(locale).format("MMMM D.")
```

Use `dayjs(isoString)` for parsing ISO strings. Never use `new Date()` directly for display.

---

## TypeScript

- Prefer `type` over `interface` for object shapes that won't be augmented or implemented.
- Use `interface` for extension points (things widgets implement, descriptor subtypes).
- Avoid `any` — use `unknown` and narrow. The only accepted `any` is in the widget registry's `factory` prop signature, which is inherently polymorphic.
- Never use non-null assertion (`!`) unless the value is genuinely guaranteed (e.g. `elementRef.current!` inside an effect that only runs when the ref is set).

---

## File Organisation

- One widget per file (or per folder for complex widgets with local hooks/queries, e.g. `buck/`).
- Widget files are in `components/widgets/`. HA-specific widgets go in `components/widgets/home-assistant/`.
- Shared hooks: `hooks.ts`. Shared types: `types.ts`. Global utilities: `tools.ts`.
- No barrel `index.ts` files inside widget folders — import directly from the file.

---

## Comments

Same rule as backend: write a comment only when the **why** is non-obvious.

```tsx
// good: explains a surprising behaviour
// config vars can be changed from another client; sync local state when they drift
useEffect(() => {
  if (config.x === position.x && config.y === position.y) return;
  setPosition({ x: config.x, y: config.y });
}, [config.x, config.y]);

// bad: describes what is obvious from the code
// set the time string
setTime(getTimeString(config.settings.timeFormat));
```
