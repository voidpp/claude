import { ApolloClient, HttpLink, InMemoryCache, split } from "@apollo/client";

import { WebSocketLink } from "@apollo/client/link/ws";
import { getMainDefinition } from "@apollo/client/utilities";
import { SubscriptionClient } from "subscriptions-transport-ws";

console.log(import.meta.env, window.location.origin);

const getAPIURL = () => {
  if (!import.meta.env.DEV) return window.location.origin + "/api/";

  const scheme = import.meta.env.VITE_API_SCHEME;
  const host = import.meta.env.VITE_API_HOST;
  const port = import.meta.env.VITE_API_PORT;
  return `${scheme}://${host}:${port}/api/`;
};
const getWebSocketAPIURL = () => {
  if (!import.meta.env.DEV) return window.location.origin.replace("http", "ws") + "/api/";

  const scheme = import.meta.env.VITE_API_WS_SCHEME;
  const host = import.meta.env.VITE_API_HOST;
  const port = import.meta.env.VITE_API_PORT;
  return `${scheme}://${host}:${port}/api/`;
};

export const mainSubscriptionClient = new SubscriptionClient(getWebSocketAPIURL(), { reconnect: true });

const wsLink = new WebSocketLink(mainSubscriptionClient);

const httpLink = new HttpLink({
  uri: getAPIURL(),
});

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return definition.kind === "OperationDefinition" && definition.operation === "subscription";
  },
  wsLink,
  httpLink
);

export const createApolloClient = () => {
  const client = new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache({
      addTypename: false,
    }),
  });

  return client;
};
