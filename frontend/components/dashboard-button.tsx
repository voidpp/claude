import AddBoxIcon from "@mui/icons-material/AddBox";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import CheckIcon from "@mui/icons-material/Check";
import { Button, Divider, ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { useAppConfig } from "../config";
import { DashboardInput } from "../graphql-types-and-hooks";
import { useBoolState } from "../hooks";
import { useAppSettings } from "../settings";
import { DashboardFormDialog } from "./dashboard-form-dialog";

export const DashbardButton = () => {
    const [isMenuOpen, openMenu, closeMenu] = useBoolState();
    const [isDialogOpen, openDialog, closeDialog] = useBoolState();
    const buttonRef = useRef(null);
    const config = useAppConfig();
    const { settings } = useAppSettings();
    const [lastCreatedDashboardId, setLastCreatedDashboardId] = useState<string | null>(null);

    const onSelectDashboard = (id: string) => {
        config.selectedDashboard.setValue(id);
        closeMenu();
    };

    const onClickOpenDialog = () => {
        openDialog();
        closeMenu();
    };

    useEffect(() => {
        if (!lastCreatedDashboardId) return;

        console.log(settings?.dashboards, lastCreatedDashboardId);

        if (settings?.dashboards.filter(d => d.id === lastCreatedDashboardId).length) {
            config.selectedDashboard.setValue(lastCreatedDashboardId);
            setLastCreatedDashboardId(null);
        }
    }, [settings?.dashboards.length, lastCreatedDashboardId]);

    const sortedDashboards = [...(settings?.dashboards ?? [])].sort((a, b) => a.name.localeCompare(b.name));

    const onDashboardCreated = (data: DashboardInput) => {
        setLastCreatedDashboardId(data.id);
    };

    return (
        <div>
            <DashboardFormDialog isOpen={isDialogOpen} close={closeDialog} onSubmit={onDashboardCreated} />
            <Button variant="contained" sx={{ marginLeft: 1 }} onClick={openMenu} ref={buttonRef}>
                dashboards
                <ArrowDropDownIcon style={{ marginRight: -10 }} />
            </Button>
            <Menu anchorEl={buttonRef.current} open={isMenuOpen} onClose={closeMenu}>
                <MenuItem onClick={onClickOpenDialog}>
                    <ListItemIcon>
                        <AddBoxIcon />
                    </ListItemIcon>
                    <ListItemText>Create</ListItemText>
                </MenuItem>
                {settings?.dashboards.length > 0 && <Divider />}
                {sortedDashboards.map(dasboard => (
                    <MenuItem
                        key={dasboard.id}
                        onClick={() => onSelectDashboard(dasboard.id)}
                        selected={dasboard.id === config.selectedDashboard.value}
                    >
                        <ListItemIcon>{dasboard.id === config.selectedDashboard.value && <CheckIcon />}</ListItemIcon>
                        <ListItemText>{dasboard.name}</ListItemText>
                    </MenuItem>
                ))}
            </Menu>
        </div>
    );
};
