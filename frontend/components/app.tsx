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

const apolloClient = createApolloClient();

export const App = () => {
    return (
        <ApolloProvider client={apolloClient}>
            <ThemeProvider theme={theme}>
                <AppConfigContextProvider>
                    <AppSettingsContextProvider>
                        <Tranlations>
                            <NotificationContextProvider>
                                <CssBaseline />
                                <MainFrame />
                            </NotificationContextProvider>
                        </Tranlations>
                    </AppSettingsContextProvider>
                </AppConfigContextProvider>
            </ThemeProvider>
        </ApolloProvider>
    );
};
