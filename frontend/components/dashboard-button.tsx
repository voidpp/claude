import { gql } from '@apollo/client';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Button, Menu, MenuItem } from "@mui/material";
import * as React from "react";
import { useRef } from "react";
import { useBoolState } from '../tools';
import { useGetDashboardListQuery } from '../types-and-hooks';

gql`
    query GetDashboardList {
        settings {
          dashboards {
            id
            name
          }
        }
    }
`;

export const DashbardButton = () => {
    const { data, loading } = useGetDashboardListQuery();
    const [isOpen, open, close] = useBoolState()
    const buttonRef = useRef(null);

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
                    <MenuItem key={dasboard.id} onClick={close}>{dasboard.name}</MenuItem>
                ))}
            </Menu>
        </div>
    );
}
