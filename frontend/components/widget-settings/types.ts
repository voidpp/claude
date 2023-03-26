export type FieldType =
    | "string"
    | "list"
    | "boolean"
    | "select"
    | "checkboxList"
    | "multiLineString"
    | "date"
    | "duration";

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

export interface FormDurationFieldDescriptor extends FormFieldDescriptor {
    showEnableButton?: boolean;
}

export interface FormListFieldDescriptor extends FormFieldDescriptor {
    fields: Array<FormFieldDescriptor>;
}

export interface FormSelectFieldDescriptor extends FormFieldDescriptor {
    options: Array<{ value: string; label: string }>;
    multiple?: boolean;
}

export interface FormCheckboxListFieldDescriptor extends FormSelectFieldDescriptor {}

export type FieldGeneratorCallbackType = (
    desc: FormFieldDescriptor,
    value: any,
    onChange: (val: any) => void
) => React.ReactNode;

export type CheckboxListValue = { [s: string]: boolean };

export type ListDataBase = {
    id: string;
    rank: number;
};
export type ListData = ListDataBase & Record<string, any>;

export type ListDataMap = Record<string, ListData>;
