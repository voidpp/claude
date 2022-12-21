import { Box } from "@mui/material";
import * as React from "react";
import { Context } from "react";

export function createContextProviderComponent<T>(context: Context<T>, useValue: () => T) {
    return ({ children }: { children: React.ReactNode }) => {
        const value = useValue();

        const Provider = context.Provider;

        return <Provider value={value}>{children}</Provider>;
    };
}

export const FormContainer = ({ children }: { children: React.ReactNode }) => (
    <Box sx={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 2, alignItems: "center" }}>{children}</Box>
);

export function IfComp(props: { cond: any; children: React.ReactNode }) {
    return <>{props.cond ? props.children : null}</>;
}
