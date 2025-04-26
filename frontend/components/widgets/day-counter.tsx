import { useInterval } from "@/hooks";
import { useAppSettings } from "@/settings";
import { BaseWidgetSettings, CommonWidgetProps } from "@/types";
import { Box, SxProps, Theme, Tooltip } from "@mui/material";
import dayjs from "dayjs";
import * as React from "react";
import { useEffect, useState } from "react";
import { RndFrame, useRnd } from "../rnd";
import { WidgetMenu } from "../widget-menu";
import { FormSelectFieldDescriptor } from "../widget-settings/types";

const formats = ["simple", "dynamic"] as const;

type Format = typeof formats[number];

export class DayCounterSettings extends BaseWidgetSettings {
  target: string;
  title: string = "";
  formatting: Format = "simple";
  showTarget: boolean = true;
}

export type DayCounterProps = CommonWidgetProps<DayCounterSettings>;

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  target: {
    px: 1,
    py: 0.3,
  },
} satisfies Record<string, SxProps<Theme>>;

const calcDayCount = (target: string) => Math.ceil(dayjs.duration(dayjs(target).diff()).asDays());

type DisplayData = { value: number; postfix: string };

const formatDynamicDays = (days: number): DisplayData => {
  if (days < 14) return { value: days, postfix: "days" };

  if (days < 365) return { value: Math.round(days / 7), postfix: "weeks" };

  return { value: Math.round(days / 30.5), postfix: "months" };
};

export const DayCounter = (props: DayCounterProps) => {
  const { config } = props;
  const rndProps = useRnd(config);
  const { saveWidget, getWidgetById } = useAppSettings();
  const [days, setDays] = useState(calcDayCount(config.settings.target));

  const sizeBase = rndProps.size.height * (config.settings.showTarget ? 1 : 1.2);

  const resetTarget = () => {
    saveWidget({
      ...getWidgetById(config.id),
      settings: {
        ...config.settings,
        target: dayjs().format(),
      },
    });
  };

  useInterval(() => {
    setDays(calcDayCount(config.settings.target));
  }, 1000 * 60 * 60);

  useEffect(() => {
    setDays(calcDayCount(config.settings.target));
  }, [config.settings.target]);

  const displayData: DisplayData =
    config.settings.formatting == "dynamic" ? formatDynamicDays(days) : { value: Math.abs(days), postfix: "days" };

  return (
    <RndFrame rndProps={rndProps}>
      <Box sx={styles.container}>
        <Box sx={{ fontSize: sizeBase * 0.1 }}>{config.settings.title}</Box>
        <Box sx={{ fontSize: sizeBase * 0.4, lineHeight: "120%" }}>{displayData.value}</Box>
        <Box sx={{ fontSize: sizeBase * 0.1, textAlign: "center" }}>{displayData.postfix}</Box>
        {config.settings.showTarget && (
          <Box sx={{ ...styles.target, fontSize: sizeBase * 0.1 }}>
            {dayjs(config.settings.target).format("YYYY-MM-DD")}
          </Box>
        )}
      </Box>
      <WidgetMenu
        id={config.id}
        settings={config.settings}
        defaultOpen={!config.settings.target}
        extraItems={[
          {
            title: "Reset target",
            onClick: resetTarget,
          },
        ]}
        settingsFormFields={[
          {
            name: "title",
            label: "Title",
          },
          {
            name: "formatting",
            label: "Formatting",
            type: "select",
            options: formats.map(format => ({
              value: format,
              label: format.charAt(0).toUpperCase() + format.slice(1),
            })),
          } as FormSelectFieldDescriptor,
          {
            name: "target",
            type: "date",
            label: "Target date",
          },
          {
            name: "showTarget",
            label: "Show target date",
          },
        ]}
      />
    </RndFrame>
  );
};
