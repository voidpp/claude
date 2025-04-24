import { useQuery } from "@tanstack/react-query";
import { useAppSettings } from "../settings";
import { HomeAssistantKeys } from "./keys";

export const useHomeAssistantServer = () => {
  const { settings } = useAppSettings();
  const haFetch = async <TResponse>({
    path,
    params,
    options,
  }: {
    path: string;
    params?: Record<string, unknown>;
    options?: RequestInit;
  }): Promise<TResponse> => {
    if (params) {
      const queryString = new URLSearchParams(
        Object.entries(params).reduce((acc, [key, value]) => {
          acc[key] = String(value);
          return acc;
        }, {} as Record<string, string>)
      ).toString();
      path += `?${queryString}`;
    }
    const response = await fetch(settings?.homeAssistantServer?.url + "/api" + path, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${settings?.homeAssistantServer?.apiToken}`,
        "Content-Type": "application/json",
      },
      ...options,
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return await response.json();
  };
  return { fetch: haFetch, enabled: settings?.homeAssistantServer?.enabled };
};

export type HomeAssistantState = {
  attributes: Record<string, unknown>;
  entity_id: string;
  last_changed: string;
  state: string;
};

export const useHomeAssistantStates = () => {
  const { fetch, enabled } = useHomeAssistantServer();
  return useQuery({
    queryKey: HomeAssistantKeys.states,
    enabled: enabled,
    queryFn: async () => {
      const states = await fetch<HomeAssistantState[]>({ path: `/states` });
      return states.sort((a, b) => a.entity_id.localeCompare(b.entity_id));
    },
  });
};

export const useHomeAssistantTemplate = <TResponse>({ template, queryKey }: { template: string; queryKey: string }) => {
  const { fetch, enabled } = useHomeAssistantServer();
  return useQuery({
    queryKey: HomeAssistantKeys.template(queryKey),
    enabled,
    queryFn: async () =>
      fetch<TResponse>({ path: `/template`, options: { method: "POST", body: JSON.stringify({ template }) } }),
  });
};

export type DeviceNumberAttributes = {
  device_class?: string;
  icon?: string;
  state_class?: string;
  unit_of_measurement?: string;
};

export type EditableNumberAttributes = {
  editable?: boolean;
  initial?: null | number;
  max?: number;
  min?: number;
  mode?: string;
  step?: number;
};

export type HomeAssistantStateExtended = {
  entity_id: string;
  name: string;
  state: string;
  attributes: { friendly_name: string } & DeviceNumberAttributes & EditableNumberAttributes;
};

export type HomeAssistantNumericState = {
  state: number;
} & HomeAssistantStateExtended;

const numericStatesTemplate = `
[
{% for state in states if state.state | float(default=none) is not none %}
  {
    "entity_id": "{{ state.entity_id }}",
    "name": {{ state.name | tojson }},
    "state": {{ state.state | float }},
    "attributes": {{ state.attributes | tojson }}
  }{% if not loop.last %},{% endif %}
{% endfor %}
]
`;

export const useHomeAssistantNumericStates = () =>
  useHomeAssistantTemplate<HomeAssistantNumericState[]>({ template: numericStatesTemplate, queryKey: "numericStates" });

const statesTemplate = `
[
{% for state in states %}
  {
    "entity_id": "{{ state.entity_id }}",
    "name": {{ state.name | tojson }},
    "state": {{ state.state | tojson }},
    "attributes": {
      {% for key, value in state.attributes.items() %}
        "{{ key }}": {{ (value|string) | tojson }}{% if not loop.last %},{% endif %}
      {% endfor %}
    }
  }{% if not loop.last %},{% endif %}
{% endfor %}
]
`;

export const useHomeAssistantStatesEx = () =>
  useHomeAssistantTemplate<HomeAssistantStateExtended[]>({ template: statesTemplate, queryKey: "states" });
