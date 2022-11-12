import { ApolloProvider } from "@apollo/client";

import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import * as React from "react";
import { createApolloClient } from "../client";
import { AppConfigContextProvider } from "../config";
import { MainFrame } from "./main-frame";

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});

const apolloClient = createApolloClient();

export const App = () => {
    return (
        <ApolloProvider client={apolloClient}>
            <ThemeProvider theme={darkTheme}>
                <AppConfigContextProvider>
                    <CssBaseline />
                    <MainFrame />
                </AppConfigContextProvider>
            </ThemeProvider>
        </ApolloProvider>
    );
}
