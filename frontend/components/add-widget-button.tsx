import AddBoxIcon from "@mui/icons-material/AddBox";
import { Button, Menu, MenuItem } from "@mui/material";
import * as React from "react";
import { useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { useAppConfig } from "../config";
import { useBoolState } from "../hooks";
import { useAppSettings } from "../settings";
import { widgetRegistry } from "./widget-registry";

export const AddWidgetButton = () => {
    const [isMenuOpen, openMenu, closeMenu] = useBoolState();
    const buttonRef = useRef(null);
    const { saveWidget } = useAppSettings();
    const { selectedDashboard } = useAppConfig();

    const addWidget = (type: string) => () => {
        closeMenu();
        saveWidget({
            dashboardId: selectedDashboard.value,
            height: widgetRegistry[type].defaultSize.h,
            id: uuidv4(),
            settings: new widgetRegistry[type].settingsType(),
            type,
            width: widgetRegistry[type].defaultSize.w,
            x: 100,
            y: 100,
        });
    };

    return (
        <>
            <Button onClick={openMenu} ref={buttonRef}>
                <AddBoxIcon sx={{ mr: 1 }} />
                Add widget
            </Button>
            <Menu anchorEl={buttonRef.current} open={isMenuOpen} onClose={closeMenu}>
                {Object.entries(widgetRegistry)
                    .sort(([key1, desc1], [key2, desc2]) => desc1.title.localeCompare(desc2.title))
                    .map(([key, desc]) => (
                        <MenuItem key={key} onClick={addWidget(key)}>
                            {desc.title}
                        </MenuItem>
                    ))}
            </Menu>
        </>
    );
};
