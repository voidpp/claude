import { Box, Typography } from "@mui/material";
import * as React from "react";

export const PageTitle = ({ title, children }: { title: string; children?: React.ReactNode }) => (
    <Typography variant="h4" sx={{ display: "flex", mb: 1 }}>
        <Box sx={{ flex: 1 }}>{title}</Box>
        {children}
    </Typography>
);
