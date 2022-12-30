import { ApolloClient, InMemoryCache } from "@apollo/client";
import { WebSocketLink } from "@apollo/client/link/ws";
import { useMemo } from "react";
import { SubscriptionClient } from "subscriptions-transport-ws";

export const useLocalApolloClient = (url: string) => {
    return useMemo(() => {
        if (!url) return;
        const link = new WebSocketLink(new SubscriptionClient(url));
        return new ApolloClient({
            link,
            cache: new InMemoryCache({
                addTypename: false,
            }),
        });
    }, [url]);
};
