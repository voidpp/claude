import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { Box, Divider, Menu, MenuItem, SxProps } from "@mui/material";
import * as React from "react";
import { useContext, useEffect, useState } from "react";
import { useAppSettings } from "../settings";
import { RndContext } from "./rnd";
import { FormFieldDescriptor } from "./widget-settings/types";
import { WidgetSettingsDialog, WidgetSettingsDialogProps } from "./widget-settings/widget-settings-dialog";

const bodyStyle: SxProps = {
  position: "absolute",
  top: -2,
  right: 5,
  fontSize: 20,
  cursor: "pointer",
  opacity: 0.2,
  transition: "opacity 0.3s",
};

export interface WidgetMenuProps<SettingsType> {
  id: string;
  settings: SettingsType;
  settingsFormFields?: Array<FormFieldDescriptor>;
  dialogTitle?: string;
  dialogText?: React.ReactNode;
  onBeforeSubmit?: (data: SettingsType) => void;
  defaultOpen?: boolean;
  dialogMaxWidth?: WidgetSettingsDialogProps["maxWidth"];
  extraItems?: { title: React.ReactNode; onClick: () => void }[];
}

export function WidgetMenu<SettingsType>(props: WidgetMenuProps<SettingsType>) {
  const [menuAnchorEl, setMenuAnchorEl] = useState();
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(props.defaultOpen ?? false);
  const { settingsFormFields = [], settings } = props;
  const { removeWidget, saveWidget, getWidgetById } = useAppSettings();
  const { disableDragging } = useContext(RndContext);

  useEffect(() => {
    if (!props.defaultOpen && settingsDialogOpen) closeSettingsDialog();
  }, [props.defaultOpen]);

  const submitSettings = (data: SettingsType) => {
    if (props.onBeforeSubmit) props.onBeforeSubmit(data);
    saveWidget({
      ...getWidgetById(props.id),
      settings: data,
    });
  };

  function openMenu(event: any) {
    setMenuAnchorEl(event.currentTarget);
  }

  function closeMenu() {
    setMenuAnchorEl(null);
  }

  const closeSettingsDialog = () => {
    setSettingsDialogOpen(false);
    disableDragging(false);
  };

  function openDialog() {
    setSettingsDialogOpen(true);
    closeMenu();
    disableDragging(true);
  }

  return (
    <Box sx={bodyStyle}>
      <Box onClick={openMenu}>
        <MoreHorizIcon />
      </Box>
      <Menu id="widget-menu" anchorEl={menuAnchorEl} keepMounted open={Boolean(menuAnchorEl)} onClose={closeMenu}>
        {settingsFormFields.length ? <MenuItem onClick={openDialog}>Settings</MenuItem> : null}
        <MenuItem onClick={() => removeWidget(props.id)}>Remove</MenuItem>
        {props.extraItems?.length > 0 && <Divider />}
        {props.extraItems?.map((item, index) => (
          <MenuItem key={index} onClick={item.onClick}>
            {item.title}
          </MenuItem>
        ))}
      </Menu>

      <WidgetSettingsDialog
        data={settings}
        show={settingsDialogOpen}
        onClose={closeSettingsDialog}
        submit={submitSettings}
        fields={settingsFormFields}
        title={props.dialogTitle}
        introText={props.dialogText}
        maxWidth={props.dialogMaxWidth}
      />
    </Box>
  );
}
