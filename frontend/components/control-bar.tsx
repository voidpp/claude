import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import MenuIcon from '@mui/icons-material/Menu';
import { Box, Button, Drawer, IconButton } from '@mui/material';
import * as React from "react";
import { useBoolState } from '../tools';



export const ControlBar = () => {
    const [isOpen, open, close] = useBoolState(false);

    const openDrawer = isOpen;

    return (
        <div>
            <IconButton sx={{ margin: 1 }} onClick={open}>
                <MenuIcon />
            </IconButton>
            <Drawer anchor="top" open={openDrawer} onClose={close}>
                <Box style={{ display: 'flex', alignItems: 'center', padding: 10 }}>
                    <span>
                        Zsomapell Klod!
                    </span>
                    <Button variant="contained" sx={{ marginLeft: 1 }}>
                        dashboards
                        <ArrowDropDownIcon />
                    </Button>
                </Box>
            </Drawer>
        </div>
    );
}
