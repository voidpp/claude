import { useEffect, useState } from "react";
import { SubscriptionClient } from "subscriptions-transport-ws";

export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

export const useSubscriptionClientStatus = (client: SubscriptionClient) => {
  const [status, setStatus] = useState<ConnectionStatus>(client?.status === 1 ? "connected" : "disconnected");

  useEffect(() => {
    if (!client) return;
    client.onConnected(() => setStatus("connected"));
    client.onConnecting(() => setStatus("connecting"));
    client.onDisconnected(() => setStatus("disconnected"));
    client.onReconnected(() => setStatus("connected"));
    client.onReconnecting(() => setStatus("connecting"));
    client.onError(() => setStatus("error"));
  }, [client]);

  return status;
};
