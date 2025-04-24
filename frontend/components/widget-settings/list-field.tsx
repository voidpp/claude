import AddBoxIcon from "@mui/icons-material/AddBox";
import DeleteIcon from "@mui/icons-material/Delete";
import { IconButton, Tooltip } from "@mui/material";
import * as React from "react";
import { v4 as uuid } from "uuid";
import { copyObject } from "../../tools";
import { Fieldset } from "../../widgets";
import { fieldGenerator } from "./field-generator";
import { FormFieldDescriptor, FormListFieldDescriptor, ListData, ListDataMap } from "./types";

type ListFieldProps = {
  desc: FormListFieldDescriptor;
  data: ListDataMap;
  onChange: (val: ListDataMap) => void;
};

export function ListField(props: ListFieldProps) {
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

  const label = (
    <>
      {desc.label}
      <Tooltip title="Add new item">
        <IconButton size="small" onClick={addRow} sx={{ ml: 0.5 }}>
          <AddBoxIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </>
  );

  return (
    <Fieldset label={label} sx={{ mb: 2 }}>
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
