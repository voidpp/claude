import { AppBar, Box, List, ListItemButton, ListItemText, Paper, Typography } from "@mui/material";
import * as React from "react";
import { Link as RouterLink, Outlet, useLocation } from "react-router-dom";
import { Link } from "../widgets";

const ListLink = ({ path, label }: { path: string; label: string }) => {
  const location = useLocation();
  return (
    <ListItemButton component={RouterLink} to={path} selected={location.pathname.startsWith(path)}>
      <ListItemText primary={label} />
    </ListItemButton>
  );
};

export const Admin = () => {
  return (
    <Box sx={{ maxWidth: 1280, mx: "auto", pt: 3 }}>
      <AppBar position="static" sx={{ mb: 1 }}>
        <Box sx={{ display: "flex", p: 1.5, alignItems: "center" }}>
          <Typography variant="h5">Claude admin panel</Typography>
          <Box sx={{ flex: 1, textAlign: "right" }}>
            <Link to="/">Dashboard</Link>
          </Box>
        </Box>
      </AppBar>

      <Box sx={{ display: "flex" }}>
        <Paper sx={{ width: 300, mr: 1, py: 1 }}>
          <List>
            <ListLink path="/admin/plugins" label="Plugins" />
            <ListLink path="/admin/dashboards" label="Dashboards" />
            <ListLink path="/admin/free-currency-api-accounts" label="Free Currency API Accounts" />
            <ListLink path="/admin/special-days" label="Special days" />
            <ListLink path="/admin/housekeeping" label="Housekeeping" />
            <ListLink path="/admin/home-assistant" label="Home Assistant" />
          </List>
        </Paper>
        <Paper sx={{ flex: 1, p: 2 }}>
          <Outlet />
        </Paper>
      </Box>
    </Box>
  );
};
