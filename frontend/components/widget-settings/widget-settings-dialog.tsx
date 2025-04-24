import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogProps,
  DialogTitle,
} from "@mui/material";
import * as React from "react";
import { useState } from "react";
import { fieldGenerator } from "./field-generator";
import { FormFieldDescriptor } from "./types";

export type WidgetSettingsDialogProps = {
  show: boolean;
  onClose: () => void;
  submit: (data: Record<string, any>) => void;
  data: Record<string, any>;
  fields: Array<FormFieldDescriptor>;
  title?: React.ReactNode;
  introText?: React.ReactNode;
  maxWidth?: DialogProps["maxWidth"];
};

export const WidgetSettingsDialog = (props: WidgetSettingsDialogProps) => {
  const { show, onClose, title = "Widget settings", submit, data, introText, maxWidth = "xs" } = props;
  const [formData, setFormData] = useState(Object.assign({}, data));

  const onSubmit = (ev: React.SyntheticEvent) => {
    ev.preventDefault();
    submit(formData);
    onClose();
  };

  const closeDialog = () => {
    setFormData(data);
    onClose();
  };

  const renderField = (desc: FormFieldDescriptor) => {
    const fieldType = desc.type || typeof data[desc.name];
    const generator = fieldGenerator[fieldType];
    if (!generator) {
      console.error("Unknown type:", fieldType, desc, desc.name, data);
      return null;
    }

    return generator(desc, formData[desc.name], (value: any) => {
      setFormData({
        ...formData,
        [desc.name]: value,
      });
    });
  };

  return (
    <Dialog open={show} onClose={closeDialog} maxWidth={maxWidth} fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <form onSubmit={onSubmit}>
        <DialogContent sx={{ "& > div": { mb: 2 } }}>
          {introText ? <DialogContentText>{introText}</DialogContentText> : null}
          {props.fields.map(renderField)}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} color="primary">
            Cancel
          </Button>
          <Button type="submit" color="primary">
            Submit
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
