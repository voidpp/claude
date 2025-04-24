import { useContext, useState, useEffect } from "react";
import { useHomeAssistantServer, HomeAssistantState } from "./client";
import { hassWebsocketContext, HomeAssistantEvent } from "./websocket-context";

export const useHAStateSubscription = (entityId: string | undefined) => {
  const context = useContext(hassWebsocketContext);
  const [value, setValue] = useState<string | undefined>();
  const { fetch, enabled } = useHomeAssistantServer();

  useEffect(() => {
    if (!enabled || !entityId) return;

    fetch<HomeAssistantState>({ path: `/states/${entityId}` }).then(state => {
      console.debug("HASS state inital value", entityId, state.state);
      setValue(state.state);
    });

    const onEvent = (event: HomeAssistantEvent) => {
      console.debug("HASS state change", event.entity_id, event.new_state.state);
      setValue(event.new_state.state);
    };
    context.subscribe([entityId], onEvent);

    return () => context.unsubscribe(onEvent);
  }, [entityId, enabled]);

  return value;
};

export const useHAStatesSubscription = (entities: string[]): Record<string, string> => {
  return useHAStatesSubscriptionMap(entities.reduce((acc, entityId) => ({ ...acc, [entityId]: entityId }), {}));
};

export const useHAStatesSubscriptionMap = <TKey extends string>(
  entityMap: Record<TKey, string>
): Record<TKey, string> => {
  const websocketClient = useContext(hassWebsocketContext);
  const [values, setValues] = useState<Record<TKey, string> | undefined>();
  const { fetch, enabled } = useHomeAssistantServer();

  useEffect(() => {
    if (!enabled || !Object.values(entityMap).length) return;

    Promise.all(
      Object.entries(entityMap).map(([key, entityId]) =>
        fetch<HomeAssistantState>({ path: `/states/${entityId}` }).then(state => ({
          key,
          state: state.state,
        }))
      )
    ).then(results => {
      const newValues = results.reduce((acc, { state, key }) => {
        acc[key as TKey] = state;
        return acc;
      }, {} as Record<TKey, string>);
      setValues(newValues);
    });
    const entityIdList = Object.values<string>(entityMap);
    const reverseEntityMap: Record<string, TKey> = Object.fromEntries(
      Object.entries(entityMap).map(([key, value]) => [value, key])
    );

    const onEvent = (event: HomeAssistantEvent) => {
      if (entityIdList.includes(event.entity_id)) {
        console.debug("HASS state change", event.entity_id, event.new_state.state);
        setValues(prevValues => ({
          ...prevValues,
          [reverseEntityMap[event.entity_id]]: event.new_state.state,
        }));
      }
    };
    websocketClient.subscribe(entityIdList, onEvent);

    return () => websocketClient.unsubscribe(onEvent);
  }, [JSON.stringify(entityMap), enabled]);

  return values;
};
