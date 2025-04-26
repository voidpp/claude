import { Box, SxProps } from "@mui/material";
import * as React from "react";
import { useAppConfig } from "../config";
import { useAppSettings } from "../settings";
import { ControlBar } from "./control-bar";
import { widgetRegistry, WidgetType } from "./widget-registry";

const containerStyle: SxProps = {
  height: "100%",
  width: "100%",
  backgroundImage: "url(/static/pics/canvas_blue_texture_surface_shadow_44965_1920x1200.jpg)",
};

export const Dashboard = () => {
  const { settings } = useAppSettings();
  const { selectedDashboard } = useAppConfig();

  const widgets = settings?.widgets ?? [];

  return (
    <>
      <ControlBar />
      <Box sx={containerStyle}>
        {widgets
          .filter(w => w.dashboardId == selectedDashboard.value)
          .map(widget => {
            const widgetDesc = widgetRegistry[widget.type as WidgetType];
            const Widget = widgetDesc.factory;
            const settingsInstance = new widgetDesc.settingsType();
            settingsInstance.load(JSON.parse(widget.settings));
            const config = {
              ...widget,
              settings: settingsInstance,
            };
            return <Widget config={config} key={widget.id} />;
          })}
      </Box>
    </>
  );
};
