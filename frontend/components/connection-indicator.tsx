import { Box, SxProps } from "@mui/material";
import * as React from "react";
import { SubscriptionClient } from "subscriptions-transport-ws";
import { ConnectionStatus, useSubscriptionClientStatus } from "../subscription-client-tools";

type ConnectionStatusDesc = {
    color: React.CSSProperties["color"];
    text: string;
};

const connectionStatuses: Record<ConnectionStatus, ConnectionStatusDesc> = {
    disconnected: {
        color: "grey",
        text: "Disconnected",
    },
    connected: {
        color: "green",
        text: "Connected",
    },
    connecting: {
        color: "orange",
        text: "Connecting",
    },
    error: {
        color: "red",
        text: "Error",
    },
};

export const ConnectionIndicator = ({
    client,
    sx,
    size = 6,
}: {
    client: SubscriptionClient;
    sx?: SxProps;
    size?: number;
}) => {
    const status = useSubscriptionClientStatus(client);

    return (
        <Box sx={{ display: "flex", margin: 1, alignItems: "center", ...sx }}>
            <Box
                sx={{
                    width: size,
                    height: size,
                    borderRadius: "50%",
                    backgroundColor: connectionStatuses[status].color,
                    mr: 2,
                    boxShadow: `0 0 6px 4px ${connectionStatuses[status].color}`,
                }}
            />
            {connectionStatuses[status].text}
        </Box>
    );
};
