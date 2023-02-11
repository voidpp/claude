import DeleteIcon from "@mui/icons-material/Delete";
import {
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogProps,
    DialogTitle,
    FormControl,
    FormControlLabel,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    TextField,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { Dayjs } from "dayjs";
import * as React from "react";
import { useState } from "react";
import { v4 as uuid } from "uuid";
import { useCurrentDashboard } from "../hooks";
import { copyObject } from "../tools";
import { Fieldset } from "../widgets";

export type FieldType = "string" | "list" | "boolean" | "select" | "checkboxList" | "multiLineString" | "date";

export interface FormFieldDescriptor {
    name: string;
    label: string;
    type?: FieldType;
    required?: boolean;
    default?: any;
    small?: boolean;
}

export interface FormNumberFieldDescriptor extends FormFieldDescriptor {
    min?: number;
    max?: number;
}

export interface FormListFieldDescriptor extends FormFieldDescriptor {
    fields: Array<FormFieldDescriptor>;
}

export interface FormSelectFieldDescriptor extends FormFieldDescriptor {
    options: Array<{ value: string; label: string }>;
}

export interface FormCheckboxListFieldDescriptor extends FormSelectFieldDescriptor {}

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

type ListData = {
    id: string;
    rank: number;
} & Record<string, any>;

type ListDataMap = Record<string, ListData>;

type ListFieldProps = {
    desc: FormListFieldDescriptor;
    data: ListDataMap;
    onChange: (val: ListDataMap) => void;
};

function ListField(props: ListFieldProps) {
    const { desc, data, onChange } = props;
    const { fields } = desc;
    const defaultRowData = fields.reduce((obj, field) => {
        obj[field.name] = field.default;
        return obj;
    }, {} as Record<string, any>);

    const addRow = () => {
        const id = uuid();
        const dataList = Object.values(data);
        const rank = dataList.length ? Math.max(...dataList.map(r => r.rank)) + 1 : 0;
        onChange(Object.assign({}, data, { [id]: { id, rank, ...defaultRowData } }));
    };

    const delRow = (rowId: string) => (ev: any) => {
        let newData = copyObject(data);
        delete newData[rowId];
        onChange(newData);
    };

    const updateCell = (rowId: string, name: string) => (val: any) => {
        let newData = copyObject(data);
        newData[rowId][name] = val;
        onChange(newData);
    };

    const renderCell = (rowData: ListData, desc: FormFieldDescriptor) => {
        return (
            <td key={`${rowData.id}_${desc.name}`}>
                {fieldGenerator[desc.type || typeof rowData[desc.name]](
                    desc,
                    rowData[desc.name],
                    updateCell(rowData.id, desc.name)
                )}
            </td>
        );
    };

    const renderRow = (rowData: ListData) => {
        return (
            <tr key={rowData.id}>
                {fields.map(desc => renderCell(rowData, desc))}
                <td>
                    <IconButton onClick={delRow(rowData.id)} sx={{ mt: 0.5 }}>
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </td>
            </tr>
        );
    };

    return (
        <Fieldset label={desc.label} sx={{ mb: 2 }}>
            <Button variant="contained" size="small" onClick={addRow}>
                Add
            </Button>
            <table>
                <tbody>
                    {Object.values(data)
                        .sort((s1, s2) => s1.rank - s2.rank)
                        .map(renderRow)}
                </tbody>
            </table>
        </Fieldset>
    );
}

type FieldGeneratorCallbackType = (
    desc: FormFieldDescriptor,
    value: any,
    onChange: (val: any) => void
) => React.ReactNode;

type CheckboxListValue = { [s: string]: boolean };

const getStringFieldFactory =
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

const fieldGenerator: { [s: string]: FieldGeneratorCallbackType } = {
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
            console.error("Undefined type:", fieldType, desc, desc.name, data);
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
        <Dialog open={show} onClose={closeDialog} maxWidth={maxWidth}>
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
