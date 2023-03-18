import { ApolloClient, HttpLink, InMemoryCache, split } from "@apollo/client";
import { WebSocketLink } from "@apollo/client/link/ws";
import { getMainDefinition } from "@apollo/client/utilities";
import { useMemo } from "react";
import { SubscriptionClient } from "subscriptions-transport-ws";

class BuckApolloClient<T> extends ApolloClient<T> {
    public subscriptionClient: SubscriptionClient;
}

export const useBuckClient = (host: string, port: number) => {
    return useMemo(() => {
        if (!host) return;
        const subscriptionClient = new SubscriptionClient(`ws://${host}:${port}/api/subscribe`, {reconnect: true});
        const wsLink = new WebSocketLink(subscriptionClient);
        const httpLink = new HttpLink({
            uri: `http://${host}:${port}/api/graphql`,
        });
        const splitLink = split(
            ({ query }) => {
                const definition = getMainDefinition(query);
                return definition.kind === "OperationDefinition" && definition.operation === "subscription";
            },
            wsLink,
            httpLink
        );
        const client = new BuckApolloClient({
            link: splitLink,
            cache: new InMemoryCache({
                addTypename: false,
            }),
        });
        client.subscriptionClient = subscriptionClient;
        return client;
    }, [host, port]);
};
