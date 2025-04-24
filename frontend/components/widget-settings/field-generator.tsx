import {
  Autocomplete,
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
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
  FormSelectFieldDescriptor2,
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

type SelectValue<TMultiple> = TMultiple extends true ? string[] : string;

export const fieldGenerator: Record<string, FieldGeneratorCallbackType> = {
  date: (desc: FormSelectFieldDescriptor, value: Dayjs, onChange: (val: Dayjs) => void) => {
    const currentDashboard = useCurrentDashboard();
    return (
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={currentDashboard.locale ?? "en"} key={desc.name}>
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
  select: (desc: FormSelectFieldDescriptor, value: string | string[], onChange: (val: string | string[]) => void) => {
    // select: <TMultiple extends boolean | undefined = false>(
    //   desc: FormSelectFieldDescriptor2<TMultiple>,
    //   value: SelectValue<TMultiple>,
    //   onChange: (val: SelectValue<TMultiple>) => void
    // ) => {
    // const selectedOptions = React.useMemo(() => {
    //   if (Array.isArray(value)) {
    //     return desc.options.filter(option => value.includes(option.value));
    //   }
    //   return desc.options.find(option => option.value === value) || null;
    // }, [desc.options, value]);
    // return (
    //   <Autocomplete<SelectValue<TMultiple>, TMultiple>
    //     key={desc.name}
    //     multiple={desc.multiple}
    //     fullWidth
    //     slotProps={{
    //       popper: { style: { width: "fit-content" } },
    //     }}
    //     options={desc.options}
    //     value={selectedOptions}
    //     size={desc.small ? "small" : "medium"}
    //     getOptionLabel={option => option.label}
    //     renderOption={(props, option) => {
    //       const { key, ...optionProps } = props;
    //       return (
    //         <Box key={option.value} component="li" {...optionProps}>
    //           <Box sx={{ display: "flex", flexDirection: "column" }}>
    //             {option.label}
    //             {option.subLabel && <Box sx={{ opacity: 0.7, fontSize: "0.8em" }}>{option.subLabel}</Box>}
    //           </Box>
    //         </Box>
    //       );
    //     }}
    //     onChange={(_, newValue) => {
    //       if (Array.isArray(newValue)) {
    //         onChange(newValue.map(option => option.value));
    //       } else {
    //         onChange(newValue?.value || "");
    //       }
    //     }}
    //     renderInput={params => <TextField {...params} label={desc.label} />}
    //   />
    // );
    // const selectedOptions = React.useMemo(() => {
    //   if (Array.isArray(value)) {
    //     return desc.options.filter(option => value.includes(option.value));
    //   }
    //   return desc.options.find(option => option.value === value) || null;
    // }, [desc.options, value]);
    // return (
    //   <Autocomplete
    //     key={desc.name}
    //     multiple={desc.multiple}
    //     fullWidth
    //     slotProps={{
    //       popper: { style: { width: "fit-content" } },
    //     }}
    //     options={desc.options}
    //     value={selectedOptions}
    //     size={desc.small ? "small" : "medium"}
    //     getOptionLabel={option => option.label}
    //     renderOption={(props, option) => {
    //       const { key, ...optionProps } = props;
    //       return (
    //         <Box key={option.value} component="li" {...optionProps}>
    //           <Box sx={{ display: "flex", flexDirection: "column" }}>
    //             {option.label}
    //             {option.subLabel && <Box sx={{ opacity: 0.7, fontSize: "0.8em" }}>{option.subLabel}</Box>}
    //           </Box>
    //         </Box>
    //       );
    //     }}
    //     onChange={(_, newValue) => {
    //       if (Array.isArray(newValue)) {
    //         onChange(newValue.map(option => option.value));
    //       } else {
    //         onChange(newValue?.value || "");
    //       }
    //     }}
    //     renderInput={params => <TextField {...params} label={desc.label} />}
    //   />
    // );
    // FIXME: fucking Autocomplete.multiple ...
    if (desc.multiple) {
      return (
        <Autocomplete
          key={desc.name}
          multiple
          fullWidth
          slotProps={{
            popper: { style: { width: "fit-content" } },
          }}
          options={desc.options}
          value={desc.options.filter(option => value.includes(option.value))}
          size={desc.small ? "small" : "medium"}
          getOptionLabel={option => option.label}
          renderOption={(props, option) => {
            const { key, ...optionProps } = props;
            return (
              <Box key={option.value} component="li" {...optionProps}>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  {option.label}
                  {option.subLabel && <Box sx={{ opacity: 0.7, fontSize: "0.8em" }}>{option.subLabel}</Box>}
                </Box>
              </Box>
            );
          }}
          onChange={(_, newValue) => {
            onChange(newValue.map(option => option.value));
          }}
          renderInput={params => <TextField {...params} label={desc.label} />}
        />
      );
    }
    return (
      <Autocomplete
        key={desc.name}
        multiple={false}
        fullWidth
        slotProps={{
          popper: { style: { width: "fit-content" } },
        }}
        options={desc.options}
        value={desc.options.find(option => option.value === value) || null}
        size={desc.small ? "small" : "medium"}
        getOptionLabel={option => option.label}
        renderOption={(props, option) => {
          const { key, ...optionProps } = props;
          return (
            <Box key={option.value} component="li" {...optionProps}>
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                {option.label}
                {option.subLabel && <Box sx={{ opacity: 0.7, fontSize: "0.8em" }}>{option.subLabel}</Box>}
              </Box>
            </Box>
          );
        }}
        onChange={(_, newValue) => onChange(newValue?.value || "")}
        renderInput={params => <TextField {...params} label={desc.label} />}
      />
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
