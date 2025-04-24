import { createContext } from "react";

type HomeAssistantEventState = {
  entity_id: string;
  state: string;
  attributes: {
    state_class: string;
    unit_of_measurement: string;
    icon: string;
    friendly_name: string;
  };
  last_changed: string;
  last_reported: string;
  last_updated: string;
  context: {
    id: string;
    parent_id: string | null;
    user_id: string | null;
  };
};

export type HomeAssistantEvent = {
  entity_id: string;
  old_state: HomeAssistantEventState;
  new_state: HomeAssistantEventState;
};

export type HASocketMessage = {
  type: "event" | "auth_required" | "auth_ok" | "auth_invalid" | "result";
  event?: {
    event_type: "state_changed";
    data: HomeAssistantEvent;
    origin: string;
    time_fired: string;
    context: {
      id: string;
      parent_id: string | null;
      user_id: string | null;
    };
  };
  id: number;
};

export type HASSStateChangeListener = (event: HomeAssistantEvent) => void;

export type HASSWebsocketContextData = {
  subscribe: (entityIdList: string[], onEvent: HASSStateChangeListener) => void;
  unsubscribe: (onEvent: HASSStateChangeListener) => void;
};

export const hassWebsocketContext = createContext<HASSWebsocketContextData>({
  subscribe: () => {
    console.warn("HASSWebsocketContext not initialized");
  },
  unsubscribe: () => {
    console.warn("HASSWebsocketContext not initialized");
  },
});
