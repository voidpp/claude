import MenuIcon from '@mui/icons-material/Menu';
import SettingsIcon from '@mui/icons-material/Settings';
import { Box, Button, Divider, Drawer, IconButton, Menu, MenuItem, Typography } from '@mui/material';
import * as React from "react";
import { useRef } from "react";
import { useAppConfig } from '../config';
import { useAppSettings } from '../settings';
import { copyObject, useBoolState } from '../tools';
import { DashbardButton } from './dashboard-button';
import { DashboardFormDialog } from './dashboard-form-dialog';

const AddWidgetButton = () => {
    const [isMenuOpen, openMenu, closeMenu] = useBoolState();
    const buttonRef = useRef(null);

    return (
        <>
            <Button onClick={openMenu} ref={buttonRef}>
                Add widget
            </Button>
            <Menu
                anchorEl={buttonRef.current}
                open={isMenuOpen}
                onClose={closeMenu}
            >
                <MenuItem>
                    yey
                </MenuItem>
            </Menu>
        </>
    );
}

const CurrentDashboardItem = () => {
    const { selectedDashboard } = useAppConfig();
    const { settings } = useAppSettings();
    const [isDialogOpen, openDialog, closeDialog] = useBoolState();

    const currentDashboard = settings?.dashboards.filter(db => db.id === selectedDashboard.value)[0];

    if (!selectedDashboard.value)
        return <Typography sx={{ fontStyle: 'italic' }}>No dashboard selected</Typography>;

    if (!currentDashboard)
        return <span />;

    return (
        <Box style={{ display: 'flex', alignItems: 'center', marginTop: -10, marginBottom: -10 }}>
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
}

export const ControlBar = () => {
    const [isOpen, open, close] = useBoolState(true);

    const openDrawer = isOpen;

    return (
        <div>
            <IconButton sx={{ margin: 1 }} onClick={open}>
                <MenuIcon />
            </IconButton>
            <Drawer anchor="top" open={openDrawer} onClose={close}>
                <Box style={{ display: 'flex', alignItems: 'center', padding: 10 }}>
                    <span style={{ paddingRight: 10 }}>
                        Zsomapell Klod!
                    </span>
                    <DashbardButton />
                    <Divider orientation="vertical" flexItem sx={{ marginLeft: 2, marginRight: 2 }} />
                    <CurrentDashboardItem />
                </Box>
            </Drawer>
        </div>
    );
}
