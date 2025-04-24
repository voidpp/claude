import { ApolloProvider } from "@apollo/client";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import * as React from "react";
import { createApolloClient } from "../client";
import { AppConfigContextProvider } from "../config";
import { NotificationContextProvider } from "../notifications";
import { AppSettingsContextProvider } from "../settings";
import { MainFrame } from "./main-frame";
import { theme } from "./theme";
import { Tranlations } from "./tranlations";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HASSWebsocketProvider } from "@/home-assistant/websocket-context-provider";

const apolloClient = createApolloClient();
const queryClient = new QueryClient();

export const App = () => {
  return (
    <ApolloProvider client={apolloClient}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <AppConfigContextProvider>
            <AppSettingsContextProvider>
              <Tranlations>
                <NotificationContextProvider>
                  <CssBaseline />
                  <HASSWebsocketProvider>
                    <MainFrame />
                  </HASSWebsocketProvider>
                </NotificationContextProvider>
              </Tranlations>
            </AppSettingsContextProvider>
          </AppConfigContextProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ApolloProvider>
  );
};
