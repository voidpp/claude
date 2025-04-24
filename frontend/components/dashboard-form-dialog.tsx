import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import * as React from "react";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Dashboard, DashboardInput } from "../graphql-types-and-hooks";
import { useNotifications } from "../notifications";
import { useAppSettings } from "../settings";
import { Locales } from "../types";
import { FormContainer } from "../widgets";

type Props = {
  isOpen: boolean;
  close: () => void;
  initialData?: DashboardInput;
  onSubmit?: (data: DashboardInput) => void;
};

const createDefaultValues = (): DashboardInput => ({
  id: uuidv4(),
  name: "",
  background: "",
  stepSize: 10,
  theme: "",
  locale: Locales.English,
});

export const DashboardFormDialog = ({ isOpen, close, initialData, onSubmit: onSubmitProp }: Props) => {
  const { saveDashboard } = useAppSettings();
  const [data, setData] = useState<DashboardInput>(initialData ?? createDefaultValues);
  const { showNotification } = useNotifications();

  useEffect(() => {
    if (initialData) setData(initialData);
  }, [initialData?.id]);

  const dataUpdater =
    (key: keyof Dashboard, converter: (val: string) => any = (val: string) => val) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setData({ ...data, [key]: converter(event.target.value) });
    };

  const onSubmit = async () => {
    await saveDashboard(data);
    close();
    showNotification("Dashboard saved");
    onSubmitProp?.(data);
    if (!initialData) setData(createDefaultValues());
  };

  return (
    <Dialog open={isOpen} onClose={close}>
      <DialogTitle>{initialData ? "Edit" : "Create"} dashboard</DialogTitle>
      <Divider />
      <DialogContent>
        <FormContainer>
          <Typography>Name</Typography>
          <TextField required variant="outlined" size="small" value={data.name} onChange={dataUpdater("name")} />
          <Typography>Step size</Typography>
          <TextField
            variant="outlined"
            size="small"
            type="number"
            value={data.stepSize}
            onChange={dataUpdater("stepSize", parseInt)}
          />
          <Typography>Theme</Typography>
          <TextField variant="outlined" size="small" value={data.theme} onChange={dataUpdater("theme")} />
          <Typography>Locale</Typography>
          <Select variant="outlined" size="small" value={data.locale} onChange={dataUpdater("locale")}>
            {Object.entries(Locales).map(([key, value]) => (
              <MenuItem key={key} value={value}>
                {key}
              </MenuItem>
            ))}
          </Select>
        </FormContainer>
      </DialogContent>
      <Divider />
      <DialogActions>
        <Button onClick={onSubmit}>submit</Button>
        <Button onClick={close}>cancel</Button>
      </DialogActions>
    </Dialog>
  );
};
