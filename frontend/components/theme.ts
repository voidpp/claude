import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
    palette: {
        mode: "dark",
    },
    components: {
        MuiLink: {
            styleOverrides: {
                root: {
                    textDecoration: "none",
                },
            },
        },
        MuiTooltip: {
            defaultProps: {
                placement: "top",
                arrow: true,
            }
        },
    },
});
