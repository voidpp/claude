import { useNotifications } from "@/notifications";
import { useAppSettings } from "@/settings";
import { Box, Button, Checkbox, FormControlLabel, TextField, Typography } from "@mui/material";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { PageTitle } from "./widgets";

export const HomeAssistant = () => {
  const { settings, saveHomeAssistantServer } = useAppSettings();
  const { showNotification } = useNotifications();
  const { control, watch, getValues } = useForm({
    defaultValues: {
      enabled: settings?.homeAssistantServer?.enabled ?? false,
      url: settings?.homeAssistantServer?.url ?? "",
      apiToken: settings?.homeAssistantServer?.apiToken ?? "",
    },
  });

  const enabled = watch("enabled");

  const submit = async () => {
    const data = getValues();
    await saveHomeAssistantServer(data);
    showNotification("Home Assistant server saved", "success");
  }

  return <Box>
    <PageTitle title="Home Assistant Integration" />
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 2, maxWidth: 400 }}>
      <Controller
        name="enabled"
        control={control}
        render={({ field }) => (
          <FormControlLabel
            control={<Checkbox {...field} checked={field.value} />}
            label={
              <Typography variant="body1">
                Enable Home Assistant Integration
              </Typography>
            }
          />
        )}
      />
      <Controller
        name="url"
        control={control}
        disabled={!enabled}
        render={({ field }) => <TextField {...field} label="URL" size="small" fullWidth />}
      />
      <Controller
        name="apiToken"
        control={control}
        disabled={!enabled}
        render={({ field }) => <TextField {...field} label="Token" size="small" fullWidth />}
      />
    </Box>
    <Button onClick={submit}>save</Button>
    <Button onClick={() => saveHomeAssistantServer(null)}>clear</Button>
  </Box>
};
