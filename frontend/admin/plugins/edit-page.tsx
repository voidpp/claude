import * as React from "react";
import {PluginType, usePluginDataQuery, useSavePluginMutation} from "@/graphql-types-and-hooks";
import {Box} from "@mui/system";
import {useParams} from "react-router-dom";
import Editor from '@monaco-editor/react';
import {Button, FormControl, InputLabel, MenuItem, Select, TextField} from "@mui/material";
import {Controller, useForm} from "react-hook-form";
import {useNotifications} from "@/notifications";
import {PageTitle} from "@/admin/widgets";

type PluginEditFormData = {
  name: string,
  className: string,
  content: string,
  type: PluginType,
}

export const PluginEditPage = () => {
  const {showNotification} = useNotifications();
  const {pluginId} = useParams<{ pluginId: string }>();
  const {control, reset, formState, handleSubmit} = useForm<PluginEditFormData>({
    defaultValues: {
      name: "",
      className: "",
      content: "",
      type: PluginType.Weather,
    }
  });

  usePluginDataQuery({
    variables: {id: pluginId}, onCompleted: (data) => {
      reset({
        name: data.pluginData.metadata.name,
        className: data.pluginData.metadata.className,
        content: data.pluginData.content,
        type: data.pluginData.metadata.type,
      })
    }
  });
  const [savePlugin] = useSavePluginMutation();

  const onSubmit = async (data: PluginEditFormData) => {
    await savePlugin({
      variables: {
        id: pluginId,
        file: data.content,
        className: data.className,
        name: data.name,
        type: data.type,
      }
    })
    reset(data);
    showNotification("Plugin saved");
  }

  return (
    <Box>
      <PageTitle title="Edit plugin"/>
      <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, mt: 2}}>
        <Box sx={{display: 'flex', gap: 2}}>
          <Controller
            name="name"
            control={control}
            render={({field}) => <TextField {...field} label="Name" size="small" fullWidth/>}
          />
          <Controller
            name="className"
            control={control}
            render={({field}) => <TextField {...field} label="Name" size="small" fullWidth/>}
          />
          <Controller
            control={control}
            name="type"
            render={({field}) => (
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select {...field} size="small" label="Type">
                  {Object.entries(PluginType).map(([key, value]) => (
                    <MenuItem key={key} value={value}>
                      {key}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}/>
          <Button
            variant="contained"
            disabled={!formState.isDirty}
            onClick={handleSubmit(onSubmit)}
          >
            save
          </Button>
        </Box>
        <Controller
          name="content"
          control={control}
          render={({field}) => (
            <Editor
              height="900px"
              defaultLanguage="python"
              value={field.value}
              onChange={field.onChange}
              theme="vs-dark"
              options={{minimap: {enabled: false}}}
            />
          )}
        />

      </Box>
    </Box>
  )
}
