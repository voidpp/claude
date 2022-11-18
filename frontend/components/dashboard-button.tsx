import AddIcon from '@mui/icons-material/Add';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CheckIcon from '@mui/icons-material/Check';
import { Button, Divider, ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import * as React from "react";
import { useRef } from "react";
import { useAppConfig } from '../config';
import { useAppSettings } from '../settings';
import { useBoolState } from '../tools';
import { DashboardFormDialog } from './dashboard-form-dialog';


export const DashbardButton = () => {
    const [isMenuOpen, openMenu, closeMenu] = useBoolState();
    const [isDialogOpen, openDialog, closeDialog] = useBoolState();
    const buttonRef = useRef(null);
    const config = useAppConfig();
    const { settings } = useAppSettings();

    const onSelectDashboard = (id: string) => {
        config.selectedDashboard.setValue(id);
        closeMenu();
    }

    const onClickOpenDialog = () => {
        openDialog();
        closeMenu();
    }

    const sortedDashboards = [...settings?.dashboards ?? []].sort((a, b) => a.name.localeCompare(b.name));

    return (
        <div>
            <DashboardFormDialog isOpen={isDialogOpen} close={closeDialog} />
            <Button
                variant="contained"
                sx={{ marginLeft: 1 }}
                onClick={openMenu}
                ref={buttonRef}
                disabled={settings?.dashboards.length == 0}
            >
                dashboards
                <ArrowDropDownIcon style={{ marginRight: -10 }} />
            </Button>
            <Menu
                anchorEl={buttonRef.current}
                open={isMenuOpen}
                onClose={closeMenu}
            >
                <MenuItem onClick={onClickOpenDialog}>
                    <ListItemIcon>
                        <AddIcon />
                    </ListItemIcon>
                    <ListItemText>
                        Create
                    </ListItemText>
                </MenuItem>
                <Divider />
                {sortedDashboards.map(dasboard => (
                    <MenuItem
                        key={dasboard.id}
                        onClick={() => onSelectDashboard(dasboard.id)}
                        selected={dasboard.id === config.selectedDashboard.value}
                    >
                        <ListItemIcon>
                            {dasboard.id === config.selectedDashboard.value && <CheckIcon />}
                        </ListItemIcon>
                        <ListItemText>
                            {dasboard.name}
                        </ListItemText>
                    </MenuItem>
                ))}
            </Menu>
        </div>
    );
};
