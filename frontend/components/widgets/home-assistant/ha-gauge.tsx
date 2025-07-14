import { Gauge } from "@mui/x-charts/Gauge";
import * as React from "react";
import { RndFrame, useRnd } from "../../rnd";
import { WidgetMenu } from "../../widget-menu";
import { BaseWidgetSettings, CommonWidgetProps } from "@/types";
import { useHomeAssistantNumericStates } from "@/home-assistant/client";
import { FormSelectFieldDescriptor } from "@/components/widget-settings/types";
import { useHAStateSubscription } from "@/home-assistant/websocket-hooks";
import { Box, useTheme } from "@mui/material";
import { gaugeClasses } from "@mui/x-charts";
import { useMemo } from "react";

import { format } from "d3-format";

export class HAGaugeSettings extends BaseWidgetSettings {
  entityName: string = "";
  min: number = 0;
  max: number = 100;
  title: string = "";
  unit: string = "";
  errorValue: number = 100;
  format: string = ".0f";
}

export type HAGaugeProps = CommonWidgetProps<HAGaugeSettings>;

export const HAGauge = (props: HAGaugeProps) => {
  const { config } = props;
  const rndProps = useRnd(config);
  const { data: stateList } = useHomeAssistantNumericStates();
  const value = useHAStateSubscription(config.settings.entityName);
  const theme = useTheme();

  const entityDesc = useMemo(
    () => stateList?.find(state => state.entity_id === config.settings.entityName),
    [stateList, config.settings.entityName]
  );

  const numberFormatter = useMemo(() => format(config.settings.format), [config.settings.format]);

  const sizeBase = Math.min(rndProps.size.height, rndProps.size.width);

  const numberValue = parseInt(value);

  const gaugeColor = numberValue >= config.settings.errorValue ? theme.palette.error.main : theme.palette.success.main;

  const unit = config.settings.unit ? config.settings.unit : entityDesc?.attributes?.unit_of_measurement ?? "";

  const title = config.settings.title ? config.settings.title : entityDesc?.attributes?.friendly_name ?? "";

  return (
    <RndFrame rndProps={rndProps}>
      {config.settings.entityName != "" && value && (
        <Box
          sx={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            p: 1,
          }}
        >
          <Gauge
            value={numberValue}
            startAngle={-120}
            endAngle={120}
            valueMin={config.settings.min}
            valueMax={config.settings.max}
            sx={{
              fontSize: sizeBase * 0.25,
              [`& .${gaugeClasses.valueArc}`]: {
                fill: gaugeColor,
              },
            }}
            text={`${numberFormatter(numberValue)}${unit}`}
          />
          <Box sx={{ fontSize: sizeBase * 0.1 }}>{title}</Box>
        </Box>
      )}
      <WidgetMenu
        id={config.id}
        settings={config.settings}
        defaultOpen={!config.settings.entityName}
        settingsFormFields={[
          {
            name: "entityName",
            label: "Entity",
            required: true,
            type: "select",
            options:
              stateList?.map(state => ({
                value: state.entity_id,
                label: state.name,
              })) ?? [],
          } as FormSelectFieldDescriptor,
          {
            name: "title",
            label: "Title",
          },
          {
            name: "min",
            label: "Min",
          },
          {
            name: "max",
            label: "Max",
          },
          {
            name: "unit",
            label: "Unit",
          },
          {
            name: "errorValue",
            label: "Error value",
          },
          {
            name: "format",
            label: "Number format (d3-format)",
          },
        ]}
      />
    </RndFrame>
  );
};
