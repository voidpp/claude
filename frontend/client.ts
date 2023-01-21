import { ApolloClient, HttpLink, InMemoryCache, split } from "@apollo/client";

import { WebSocketLink } from "@apollo/client/link/ws";
import { getMainDefinition } from "@apollo/client/utilities";
import { SubscriptionClient } from "subscriptions-transport-ws";

const wsLink = new WebSocketLink(new SubscriptionClient(`ws://${window.location.host}/api/`));

const httpLink = new HttpLink({
    uri: "/api/",
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
