import { Menu, MenuItem, SxProps } from "@mui/material";
import * as React from "react";
import { useState } from "react";
import { FormFieldDescriptor } from "./widget-settings-dialog";


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
    const [isSettingsDialogShown, showSettingDialog] = useState(false);
    const { settingsFormFields = [], settings } = props;

    const submitSettings = (data: SettingsType) => {
        if (props.onBeforeSubmit)
            props.onBeforeSubmit(data);
        // store.dispatch(updateWidgetConfig(props.id, {settings: data}));
    }

    function openMenu(event) {
        setMenuAnchorEl(event.currentTarget);
    }

    function closeMenu() {
        setMenuAnchorEl(null);
    }

    function openDialog() {
        showSettingDialog(true);
        closeMenu();
        // store.dispatch(setIsDalogOpen(true));
    }

    return (
        <div>
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
                <MenuItem
                // onClick={() => store.dispatch(removeWidget(props.id))}
                >
                    Remove
                </MenuItem>
            </Menu>

            <WidgetSettingsDialog
                data={settings}
                show={isSettingsDialogShown}
                onClose={() => {
                    showSettingDialog(false);
                    // store.dispatch(setIsDalogOpen(false));
                }}
                submit={submitSettings}
                fields={settingsFormFields}
                title={props.dialogTitle}
                introText={props.dialogText}
            />
        </div>
    );
}