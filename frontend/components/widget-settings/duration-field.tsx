import { Box, Checkbox, FormControlLabel, InputAdornment, SxProps, TextField } from "@mui/material";
import * as React from "react";

const minMax = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const DurationNumberField = ({
  value,
  onChange,
  postfix,
  min = -Infinity,
  max = Infinity,
  sx,
  disabled,
}: {
  value: number;
  onChange: (value: number) => void;
  postfix: string;
  min?: number;
  max?: number;
  sx?: SxProps;
  disabled?: boolean;
}) => (
  <TextField
    value={value}
    onChange={event => {
      const newValue = parseInt(event.target.value);
      onChange(isNaN(newValue) ? 0 : minMax(newValue, min, max));
    }}
    variant="standard"
    margin="none"
    size="small"
    disabled={disabled}
    InputProps={{
      endAdornment: (
        <InputAdornment position="end" sx={{ ml: 0.5, mb: "2px" }}>
          {postfix}
        </InputAdornment>
      ),
      inputProps: {
        style: {
          textAlign: "right",
        },
      },
    }}
    sx={{ width: "3em", ...sx }}
  />
);

type DurationFieldProps = {
  value: number;
  onChange: (value: number) => void;
  showEnableButton: boolean;
  default: number;
};

export const DurationField = ({ value, onChange, showEnableButton, default: defaultValue }: DurationFieldProps) => {
  const enabled = value > 0 || !showEnableButton;
  const hours = Math.floor(Math.abs(value) / 3600);
  const minutes = Math.floor((Math.abs(value) % 3600) / 60);
  const seconds = Math.abs(value) % 60;
  return (
    <Box sx={{ display: "flex", gap: 2 }}>
      {showEnableButton && (
        <FormControlLabel
          sx={{ m: 0 }}
          control={
            <Checkbox
              checked={enabled}
              onChange={() => onChange(value === 0 ? defaultValue : value * -1)}
              sx={{ my: -1, ml: -1, mr: -0.5 }}
            />
          }
          label="Enable"
        />
      )}
      <DurationNumberField
        value={hours}
        onChange={newValue => onChange(newValue * 3600 + minutes * 60 + seconds)}
        min={0}
        postfix="h"
        disabled={!enabled}
      />
      <DurationNumberField
        value={minutes}
        onChange={newValue => onChange(hours * 3600 + newValue * 60 + seconds)}
        min={0}
        max={59}
        postfix="m"
        disabled={!enabled}
      />
      <DurationNumberField
        value={seconds}
        onChange={newValue => onChange(hours * 3600 + minutes * 60 + newValue)}
        min={0}
        max={59}
        postfix="s"
        disabled={!enabled}
      />
    </Box>
  );
};
