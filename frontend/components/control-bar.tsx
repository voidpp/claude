import MenuIcon from "@mui/icons-material/Menu";
import SettingsIcon from "@mui/icons-material/Settings";
import { Box, Divider, Drawer, IconButton, Typography } from "@mui/material";
import * as React from "react";
import { useAppConfig } from "../config";
import { useBoolState } from "../hooks";
import { useAppSettings } from "../settings";
import { copyObject } from "../tools";
import { AddWidgetButton } from "./add-widget-button";
import { DashbardButton } from "./dashboard-button";
import { DashboardFormDialog } from "./dashboard-form-dialog";

const CurrentDashboardItem = () => {
    const { selectedDashboard } = useAppConfig();
    const { settings } = useAppSettings();
    const [isDialogOpen, openDialog, closeDialog] = useBoolState();

    const currentDashboard = settings?.dashboards.filter(db => db.id === selectedDashboard.value)[0];

    if (!selectedDashboard.value) return <Typography sx={{ fontStyle: "italic" }}>No dashboard selected</Typography>;

    if (!currentDashboard) return <span />;

    return (
        <Box style={{ display: "flex", alignItems: "center", marginTop: -10, marginBottom: -10 }}>
            <Typography>{currentDashboard.name}</Typography>
            <IconButton sx={{ margin: 1 }} onClick={openDialog}>
                <SettingsIcon />
            </IconButton>
            <DashboardFormDialog
                isOpen={isDialogOpen}
                close={closeDialog}
                initialData={copyObject(currentDashboard, ["__typename"])}
            />
            <AddWidgetButton />
        </Box>
    );
};

export const ControlBar = () => {
    const [isOpen, open, close] = useBoolState();

    const openDrawer = isOpen;

    return (
        <>
            <div style={{ position: "absolute" }}>
                <IconButton sx={{ margin: 1 }} onClick={open}>
                    <MenuIcon />
                </IconButton>
            </div>
            <Drawer anchor="top" open={openDrawer} onClose={close}>
                <Box style={{ display: "flex", alignItems: "center", padding: 10 }}>
                    <span style={{ paddingRight: 10 }}>Zsomapell Klod!</span>
                    <DashbardButton />
                    <Divider orientation="vertical" flexItem sx={{ marginLeft: 2, marginRight: 2 }} />
                    <CurrentDashboardItem />
                </Box>
            </Drawer>
        </>
    );
};
