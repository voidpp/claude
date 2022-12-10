import { Box, Menu, MenuItem, SxProps } from "@mui/material";
import * as React from "react";
import { useState } from "react";
import { useBoolState } from "../hooks";
import { useAppSettings } from "../settings";
import { FormFieldDescriptor, WidgetSettingsDialog } from "./widget-settings-dialog";


const bodyStyle: SxProps = {
    position: 'absolute',
    top: -5,
    right: 5,
    fontSize: 20,
    cursor: 'pointer',
    opacity: 0.2,
    transition: 'opacity 0.3s',
}

export interface WidgetMenuProps<SettingsType> {
    id: string,
    settings: SettingsType,
    settingsFormFields?: Array<FormFieldDescriptor>,
    dialogTitle?: string,
    dialogText?: React.ReactNode,
    onBeforeSubmit?: (data: SettingsType) => void;
}

export function WidgetMenu<SettingsType>(props: WidgetMenuProps<SettingsType>) {
    const [menuAnchorEl, setMenuAnchorEl] = useState();
    const [isSettingsDialogShown, showSettingDialog, hideSettingDialog] = useBoolState();
    const { settingsFormFields = [], settings } = props;
    const { removeWidget, saveWidget, getWidgetById } = useAppSettings();

    const submitSettings = (data: SettingsType) => {
        if (props.onBeforeSubmit)
            props.onBeforeSubmit(data);
        saveWidget({
            ...getWidgetById(props.id),
            settings: data,
        })
    }

    function openMenu(event: any) {
        setMenuAnchorEl(event.currentTarget);
    }

    function closeMenu() {
        setMenuAnchorEl(null);
    }

    function openDialog() {
        showSettingDialog();
        closeMenu();
    }

    return (
        <Box sx={bodyStyle}>
            <span onClick={openMenu}>
                ...
            </span>
            <Menu
                id="widget-menu"
                anchorEl={menuAnchorEl}
                keepMounted
                open={Boolean(menuAnchorEl)}
                onClose={closeMenu}
            >
                {settingsFormFields.length ? <MenuItem onClick={openDialog}>Settings</MenuItem> : null}
                <MenuItem onClick={() => removeWidget(props.id)}>
                    Remove
                </MenuItem>
            </Menu>

            <WidgetSettingsDialog
                data={settings}
                show={isSettingsDialogShown}
                onClose={hideSettingDialog}
                submit={submitSettings}
                fields={settingsFormFields}
                title={props.dialogTitle}
                introText={props.dialogText}
            />
        </Box>
    );
}