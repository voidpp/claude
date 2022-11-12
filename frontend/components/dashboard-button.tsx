import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CheckIcon from '@mui/icons-material/Check';
import { Button, ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import * as React from "react";
import { useRef } from "react";
import { useAppConfig } from '../config';
import { useDashboardListQuery } from '../graphql-types-and-hooks';
import { useBoolState } from '../tools';

export const DashbardButton = () => {
    const { data, loading } = useDashboardListQuery();
    const [isOpen, open, close] = useBoolState()
    const buttonRef = useRef(null);
    const config = useAppConfig();

    const onSelectDashboard = (id: string) => {
        config.selectedDashboard.setValue(id);
        close();
    }

    return (
        <div>
            <Button
                variant="contained"
                sx={{ marginLeft: 1 }}
                onClick={open}
                ref={buttonRef}
                disabled={loading || data?.settings.dashboards.length == 0}
            >
                dashboards
                <ArrowDropDownIcon style={{ marginRight: -10 }} />
            </Button>
            <Menu
                anchorEl={buttonRef.current}
                open={isOpen}
                onClose={close}
            >
                {data?.settings.dashboards.map(dasboard => (
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
}
