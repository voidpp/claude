import { Box, Link as MUILink, LinkProps as MUILinkProps, SxProps, Typography } from "@mui/material";
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

export const FlagIcon = ({ name, size = 16 }: { name: string; size?: number }) => {
    let src = "";

    if (name.length > 2) src = `/static/pics/${name}.png`;
    else src = `https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.3.0/flags/4x3/${name}.svg`;

    return <img style={{ width: size }} src={src} />;
};

export const Fieldset = ({ label, children, sx }: { label: string; children: React.ReactNode; sx?: SxProps }) => (
    <Box
        component="fieldset"
        sx={{ borderRadius: 1, borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.23)", margin: 0, ...sx }}
    >
        <Box component="legend">
            <Typography variant="caption" sx={{ mx: 0.5 }}>
                {label}
            </Typography>
        </Box>
        {children}
    </Box>
);
