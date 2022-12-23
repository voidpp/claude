import { Box, Link as MUILink, LinkProps as MUILinkProps } from "@mui/material";
import * as React from "react";
import { Context } from "react";
import { Link as RouterLink } from "react-router-dom";

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

export type LinkProps = MUILinkProps<typeof RouterLink>;

export const Link = (props: LinkProps) => (
    <MUILink component={RouterLink} {...props}>
        {props.children}
    </MUILink>
);
