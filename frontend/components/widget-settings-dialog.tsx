import { Button, Typography } from "@mui/material";
import * as React from "react";
import { v4 as uuid } from 'uuid';
import { copyObject } from "../tools";


export type FieldType = 'string' | 'list' | 'boolean' | 'select' | 'checkboxList';

export interface FormFieldDescriptor {
    name: string,
    label: string,
    type?: FieldType,
    required?: boolean,
    default?: any,
}

export interface FormNumberFieldDescriptor extends FormFieldDescriptor {
    min?: number,
    max?: number,
}

export interface FormListFieldDescriptor extends FormFieldDescriptor {
    fields: Array<FormFieldDescriptor>,
}

export interface FormSelectFieldDescriptor extends FormFieldDescriptor {
    options: Array<{ value: string, label: string }>,
}

export interface FormCheckboxListFieldDescriptor extends FormSelectFieldDescriptor {
}

export type Props = {
    show: boolean,
    onClose: () => void
    submit: (data: {}) => void,
    data: {},
    fields: Array<FormFieldDescriptor>,
    title?: React.ReactNode,
    introText?: React.ReactNode,
}

type ListData = {
    id: string,
    rank: number,
}

type ListDataMap = { [s: string]: ListData };

type ListFieldProps = {
    desc: FormListFieldDescriptor,
    data: ListDataMap,
    onChange: (val: ListDataMap) => void,
}


function ListField(props: ListFieldProps) {

    const { desc, data, onChange } = props;
    const { fields } = desc;
    const defaultRowData = fields.reduce((obj, field) => { obj[field.name] = field.default; return obj; }, {});

    const addRow = () => {
        const id = uuid();
        const dataList = Object.values(data);
        const rank = dataList.length ? Math.max(...dataList.map(r => r.rank)) + 1 : 0;
        onChange(Object.assign({}, data, { [id]: { id, rank, ...defaultRowData } }))
    }

    const delRow = (rowId: string) => _ => {
        let newData = copyObject(data);
        delete newData[rowId];
        onChange(newData);
    }

    const updateCell = (rowId: string, name: string) => (val: any) => {
        let newData = copyObject(data);
        newData[rowId][name] = val;
        onChange(newData);
    }

    const renderCell = (rowData: ListData, desc: FormFieldDescriptor) => {
        return <td key={`${rowData.id}_${desc.name}`}>
            {fieldGenerator[desc.type || typeof rowData[desc.name]](desc, rowData[desc.name], updateCell(rowData.id, desc.name))}
        </td>
    }

    const renderRow = (rowData: ListData) => {
        return <tr key={rowData.id}>
            {fields.map(desc => renderCell(rowData, desc))}
            <td style={{ padding: "0 5px", fontSize: 18, cursor: 'pointer' }}>
                <div onClick={delRow(rowData.id)}>x</div>
            </td>
        </tr>
    }

    return (
        <div style={{ margin: '10px 0' }}>
            <Typography component="span" variant="subtitle1" style={{ marginRight: 10 }}>{desc.label}: </Typography>
            <Button variant="contained" size="small" onClick={addRow}>Add</Button>
            <table>
                <tbody>
                    {Object.values(data).sort((s1, s2) => s1.rank - s2.rank).map(renderRow)}
                </tbody>
            </table>
        </div>
    )

}