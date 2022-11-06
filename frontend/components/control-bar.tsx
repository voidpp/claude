
import MenuIcon from '@mui/icons-material/Menu';
import { Box, Drawer, IconButton } from '@mui/material';
import * as React from "react";
import { useBoolState } from '../tools';
import { DashbardButton } from './dashboard-button';



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
                    <span style={{ paddingRight: 10 }}>
                        Zsomapell Klod!
                    </span>
                    <DashbardButton />
                </Box>
            </Drawer>
        </div>
    );
}
