import { Checkbox, FormControl, FormControlLabel, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { Dayjs } from "dayjs";
import * as React from "react";
import { useCurrentDashboard } from "../../hooks";
import { Fieldset } from "../../widgets";
import { DurationField } from "./duration-field";
import { ListField } from "./list-field";
import {
    CheckboxListValue,
    FieldGeneratorCallbackType,
    FormCheckboxListFieldDescriptor,
    FormDurationFieldDescriptor,
    FormFieldDescriptor,
    FormListFieldDescriptor,
    FormNumberFieldDescriptor,
    FormSelectFieldDescriptor,
    ListDataMap,
} from "./types";

export const getStringFieldFactory =
    (multiline: boolean): FieldGeneratorCallbackType =>
    (desc: FormFieldDescriptor, value: string, onChange: (val: string) => void) =>
        (
            <TextField
                key={desc.name as string}
                id={"widgetsettings_" + desc.name}
                margin="dense"
                label={desc.label}
                type="text"
                required={desc.required}
                fullWidth
                multiline={multiline}
                value={value}
                size={desc.small ? "small" : "medium"}
                onChange={ev => onChange(ev.target.value)}
            />
        );

export const fieldGenerator: { [s: string]: FieldGeneratorCallbackType } = {
    date: (desc: FormSelectFieldDescriptor, value: Dayjs, onChange: (val: Dayjs) => void) => {
        const currentDashboard = useCurrentDashboard();
        return (
            <LocalizationProvider
                dateAdapter={AdapterDayjs}
                adapterLocale={currentDashboard.locale ?? "en"}
                key={desc.name}
            >
                <DatePicker
                    label={desc.label}
                    value={value}
                    onChange={newValue => onChange(newValue)}
                    renderInput={params => (
                        <TextField {...params} fullWidth size={desc.small ? "small" : "medium"} margin="dense" />
                    )}
                />
            </LocalizationProvider>
        );
    },
    duration: (desc: FormDurationFieldDescriptor, value: number, onChange: (val: number) => void) => (
        <Fieldset label={desc.label} key={desc.name as string} sx={{ mb: 2 }}>
            <DurationField
                value={value}
                onChange={onChange}
                showEnableButton={desc.showEnableButton}
                default={desc.default}
            />
        </Fieldset>
    ),
    checkboxList: (
        desc: FormCheckboxListFieldDescriptor,
        value: CheckboxListValue,
        onChange: (val: CheckboxListValue) => void
    ) => {
        return (
            <Fieldset label={desc.label} key={desc.name as string}>
                {desc.options.map(op => (
                    <FormControlLabel
                        label={op.label}
                        key={op.value}
                        control={
                            <Checkbox
                                checked={value[op.value]}
                                onChange={ev => onChange(Object.assign({}, value, { [op.value]: ev.target.checked }))}
                                color="primary"
                                inputProps={{ "aria-label": "secondary checkbox" }}
                            />
                        }
                    />
                ))}
            </Fieldset>
        );
    },
    select: (desc: FormSelectFieldDescriptor, value: string, onChange: (val: string) => void) => {
        return (
            <FormControl fullWidth key={desc.name} size={desc.small ? "small" : "medium"} margin="dense">
                <InputLabel>{desc.label}</InputLabel>
                <Select
                    value={value}
                    onChange={v => onChange(v.target.value as string)}
                    label={desc.label}
                    size={desc.small ? "small" : "medium"}
                    multiple={desc.multiple}
                >
                    {desc.options.map(op => (
                        <MenuItem key={op.value} value={op.value}>
                            {op.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        );
    },
    list: (desc: FormListFieldDescriptor, value: ListDataMap, onChange: (val: ListDataMap) => void) => {
        return <ListField desc={desc} data={value} onChange={onChange} key={desc.name as string} />;
    },
    string: getStringFieldFactory(false),
    multiLineString: getStringFieldFactory(true),
    boolean: (desc: FormFieldDescriptor, value: boolean, onChange: (val: boolean) => void) => {
        return (
            <Fieldset label={desc.label} key={desc.name as string} sx={{ py: 0, mb: 2 }}>
                <FormControlLabel
                    label={desc.label}
                    key={desc.name as string}
                    control={
                        <Checkbox
                            checked={value}
                            onChange={ev => onChange(ev.target.checked)}
                            color="primary"
                            inputProps={{ "aria-label": "secondary checkbox" }}
                        />
                    }
                />
            </Fieldset>
        );
    },
    number: (desc: FormNumberFieldDescriptor, value: number, onChange: (val: number) => void) => {
        return (
            <TextField
                // TODO: min-max
                key={desc.name as string}
                id={"widgetsettings_" + desc.name}
                margin="dense"
                label={desc.label}
                type="number"
                required={desc.required}
                fullWidth
                value={value}
                size={desc.small ? "small" : "medium"}
                onChange={ev => onChange(parseInt(ev.target.value))}
            />
        );
    },
};
