import MenuIcon from "@mui/icons-material/Menu";
import SettingsIcon from "@mui/icons-material/Settings";
import { Box, Divider, Drawer, IconButton, Typography } from "@mui/material";
import * as React from "react";
import { useAppConfig } from "../config";
import { useBoolState, useCurrentDashboard } from "../hooks";
import { copyObject } from "../tools";
import { Link } from "../widgets";
import { AddWidgetButton } from "./add-widget-button";
import { DashbardButton } from "./dashboard-button";
import { DashboardFormDialog } from "./dashboard-form-dialog";

const CurrentDashboardItem = () => {
    const { selectedDashboard } = useAppConfig();
    const [isDialogOpen, openDialog, closeDialog] = useBoolState();

    const currentDashboard = useCurrentDashboard();

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
    const [isOpen, open, close, toggle] = useBoolState();

    const openDrawer = isOpen;

    return (
        <>
            <Box sx={{ position: "absolute", zIndex: theme => theme.zIndex.drawer + 1 }}>
                <IconButton sx={{ margin: 1 }} onClick={toggle}>
                    <MenuIcon />
                </IconButton>
            </Box>
            <Drawer anchor="top" open={openDrawer} onClose={close}>
                <Box style={{ display: "flex", alignItems: "center", padding: 10, marginLeft: 45 }}>
                    <span style={{ paddingRight: 10 }}>Zsomapell Klod!</span>
                    <DashbardButton />
                    <Divider orientation="vertical" flexItem sx={{ marginLeft: 2, marginRight: 2 }} />
                    <CurrentDashboardItem />
                    <Box sx={{ flex: 1, textAlign: "right" }}>
                        <Link to="/admin">Admin</Link>
                    </Box>
                </Box>
            </Drawer>
        </>
    );
};
