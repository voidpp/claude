import { InputAdornment, SxProps, TextField } from "@mui/material";
import * as React from "react";

const minMax = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const DurationNumberField = ({
    value,
    onChange,
    postfix,
    min = -Infinity,
    max = Infinity,
    sx,
}: {
    value: number;
    onChange: (value: number) => void;
    postfix: string;
    min?: number;
    max?: number;
    sx?: SxProps;
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

export const DurationField = ({ value, onChange }: { value: number; onChange: (value: number) => void }) => {
    const hours = Math.floor(value / 3600);
    const minutes = Math.floor((value % 3600) / 60);
    const seconds = value % 60;
    return (
        <>
            <DurationNumberField
                value={hours}
                onChange={newValue => onChange(newValue * 3600 + minutes * 60 + seconds)}
                min={0}
                postfix="h"
            />
            <DurationNumberField
                value={minutes}
                onChange={newValue => onChange(hours * 3600 + newValue * 60 + seconds)}
                min={0}
                max={59}
                postfix="m"
                sx={{ ml: 2 }}
            />
            <DurationNumberField
                value={seconds}
                onChange={newValue => onChange(hours * 3600 + minutes * 60 + newValue)}
                min={0}
                max={59}
                postfix="s"
                sx={{ ml: 2 }}
            />
        </>
    );
};
