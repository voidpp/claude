import { BaseWidgetSettings, CommonWidgetProps } from "@/types";
import { Box, LinearProgress, linearProgressClasses, styled } from "@mui/material";
import * as React from "react";
import { RndFrame, useRnd } from "../../rnd";
import { WidgetMenu } from "../../widget-menu";
import dayjs from "dayjs";
import { useHAStatesSubscriptionMap } from "@/home-assistant/websocket-hooks";
import { useHomeAssistantTemplate } from "@/home-assistant/client";
import { FormSelectFieldDescriptor } from "../../widget-settings/types";
import { Duration } from "dayjs/plugin/duration";
import { useMemo } from "react";

export class HACSBambuLabPrintProgressSettings extends BaseWidgetSettings {
  printerName: string = "";
}

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 6,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: theme.palette.grey[theme.palette.mode === "light" ? 200 : 800],
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: theme.palette.mode === "light" ? "#1a90ff" : "#308fe8",
  },
}));

export type HACSBambuLabPrintProgressProps = CommonWidgetProps<HACSBambuLabPrintProgressSettings>;

const printerListTemplate = `{{integration_entities('bambu_lab') | map('device_id') | unique | select('is_device_attr', 'via_device_id', none) | map('device_attr', 'name') | list | tojson | safe}}`;

const formatRemainingTime = (duration: Duration) => {
  const hours = Math.floor(duration.asHours());
  const minutes = duration.minutes();
  return `${hours > 0 ? `${hours}h ` : ""}${minutes}m`;
};

export const ProgressWidget = ({ printerName }: { printerName: string }) => {
  const states = useHAStatesSubscriptionMap({
    progress: `sensor.${printerName}_print_progress`,
    endTime: `sensor.${printerName}_end_time`,
    currentLayer: `sensor.${printerName}_current_layer`,
    totalLayerCount: `sensor.${printerName}_total_layer_count`,
    remainingTime: `sensor.${printerName}_remaining_time`,
    taskName: `sensor.${printerName}_task_name`,
    currentStage: `sensor.${printerName}_current_stage`,
  });

  const formattedRemainingTime = useMemo(
    () => (states?.remainingTime ? formatRemainingTime(dayjs.duration(parseInt(states.remainingTime), "minutes")) : ""),
    [states?.remainingTime]
  );

  if (!states) return <Box>Loading...</Box>;

  if (states.currentStage === "idle") {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: 20 }}>
        The printer is idle
      </Box>
    );
  }

  const isDrying = states.taskName.toLowerCase() === "filament_drying.gcode";

  return (
    <Box sx={{ py: 3, px: 2, display: "flex", flexDirection: "column", gap: 1 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box sx={{ opacity: isDrying ? 0 : 1 }}>
          Layers: {states.currentLayer} / {states.totalLayerCount}
        </Box>
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
          ~ {formattedRemainingTime} remaining <Box>({dayjs(states.endTime).format("HH:mm")})</Box>
        </Box>
      </Box>
      <Box>
        <BorderLinearProgress value={parseInt(states.progress)} variant="determinate" />
      </Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
        <Box sx={{ whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ "&:first-letter": { textTransform: "uppercase" }, fontSize: "1.1em" }}>
            {isDrying ? "Drying" : states.currentStage.replaceAll("_", " ")}
          </Box>
        </Box>
        <Box
          sx={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            fontSize: "0.95em",
            opacity: isDrying ? 0 : 0.8,
          }}
        >
          {states.taskName}
        </Box>
      </Box>
    </Box>
  );
};

export const HACSBambuLabPrintProgress = (props: HACSBambuLabPrintProgressProps) => {
  const { config } = props;
  const rndProps = useRnd(config);
  const { data: printerList } = useHomeAssistantTemplate<string[]>({
    template: printerListTemplate,
    queryKey: "bambu_lab_printer_list",
  });

  return (
    <RndFrame rndProps={rndProps}>
      {config.settings?.printerName && <ProgressWidget printerName={config.settings.printerName.toLowerCase()} />}
      <WidgetMenu
        id={config.id}
        settings={config.settings}
        defaultOpen={!config.settings.printerName}
        settingsFormFields={[
          {
            name: "printerName",
            label: "Printer Name",
            required: true,
            type: "select",
            multiple: false,
            options:
              printerList?.map(printer => ({
                value: printer,
                label: printer,
              })) ?? [],
          } as FormSelectFieldDescriptor,
        ]}
      />
    </RndFrame>
  );
};
