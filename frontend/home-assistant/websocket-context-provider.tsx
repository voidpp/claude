import * as React from "react";
import { useAppSettings } from "@/settings";
import { ReactNode, useEffect, useRef, useState } from "react";
import { HASocketMessage, HASSStateChangeListener, hassWebsocketContext } from "./websocket-context";
import ReconnectingWebSocket from "reconnecting-websocket";

export const HASSWebsocketProvider = ({ children }: { children: ReactNode }) => {
  const { settings } = useAppSettings();
  const entityListeners = useRef<Map<string, HASSStateChangeListener[]>>(new Map());
  const [subscribed, setSubscribed] = useState(false);

  const subscribe = (entityIdList: string[], onEvent: HASSStateChangeListener) => {
    for (const entityId of entityIdList) {
      if (!entityListeners.current.has(entityId)) {
        entityListeners.current.set(entityId, []);
      }
      entityListeners.current.get(entityId)?.push(onEvent);
    }
    console.debug("subscribed to", entityIdList);
    setSubscribed(true);
  };

  const unsubscribe = (onEvent: HASSStateChangeListener) => {
    for (const [entityId, listeners] of entityListeners.current.entries()) {
      const index = listeners.indexOf(onEvent);
      if (index !== -1) {
        listeners.splice(index, 1);
        console.debug("unsubscribed from", entityId);
        if (listeners.length === 0) {
          entityListeners.current.delete(entityId);
        }
      }
    }
    if (entityListeners.current.size === 0) {
      setSubscribed(false);
    }
  };

  useEffect(() => {
    if (!settings?.homeAssistantServer?.enabled || !subscribed) return;
    const url = settings.homeAssistantServer.url.replace("http", "ws") + "/api/websocket";
    const socket = new ReconnectingWebSocket(url);

    socket.onopen = () => {
      socket.send(
        JSON.stringify({
          type: "auth",
          access_token: settings.homeAssistantServer.apiToken,
        })
      );
    };

    const processMessage = (message: HASocketMessage) => {
      if (message.type === "auth_required") {
        console.info("Authentication required");
        return;
      }

      if (message.type === "auth_ok") {
        console.log("Authenticated");
        socket.send(
          JSON.stringify({
            id: 1,
            type: "supported_features",
            features: { coalesce_messages: 1 },
          })
        );
        socket.send(
          JSON.stringify({
            id: 2,
            type: "subscribe_events",
            event_type: "state_changed",
          })
        );
        return;
      }

      if (message.type === "event" && message.event?.event_type === "state_changed") {
        const eventData = message.event.data;
        const listeners = entityListeners.current.get(eventData.entity_id);
        if (listeners) {
          for (const listener of listeners) {
            listener(eventData);
          }
        }
      }
    };

    socket.onmessage = event => {
      const message: HASocketMessage | HASocketMessage[] = JSON.parse(event.data);

      if (Array.isArray(message)) {
        for (const msg of message) {
          processMessage(msg);
        }
      } else {
        processMessage(message);
      }
    };

    return () => {
      console.debug("closing websocket");
      socket.close();
    };
  }, [JSON.stringify(settings?.homeAssistantServer), subscribed]);

  return <hassWebsocketContext.Provider value={{ subscribe, unsubscribe }}>{children}</hassWebsocketContext.Provider>;
};
