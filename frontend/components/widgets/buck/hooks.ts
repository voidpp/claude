import { ApolloClient, HttpLink, InMemoryCache, split } from "@apollo/client";
import { WebSocketLink } from "@apollo/client/link/ws";
import { getMainDefinition } from "@apollo/client/utilities";
import { useMemo } from "react";
import { SubscriptionClient } from "subscriptions-transport-ws";

export const useBuckClient = (host: string, port: number) => {
    return useMemo(() => {
        if (!host) return;
        const wsLink = new WebSocketLink(new SubscriptionClient(`ws://${host}:${port}/api/subscribe`));
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
        return new ApolloClient({
            link: splitLink,
            cache: new InMemoryCache({
                addTypename: false,
            }),
        });
    }, [host, port]);
};
