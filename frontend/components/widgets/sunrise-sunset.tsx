import { SunriseSunset as SunriseSunsetType, useSunriseSunsetQuery } from "@/graphql-types-and-hooks";
import { useCurrentDashboard, useInterval } from "@/hooks";
import { BaseWidgetSettings, CommonWidgetProps } from "@/types";
import { Box } from "@mui/system";
import dayjs from "dayjs";
import * as React from "react";
import { RndFrame, useRnd } from "../rnd";
import { WidgetMenu } from "../widget-menu";
import { FormCheckboxListFieldDescriptor } from "../widget-settings/types";

type SunriseSunsetKeys = keyof Omit<SunriseSunsetType, "__typename">;

type FormatterContex = {
  locale: string;
};

type ValueDescriptor = {
  label: string;
  showDefault: boolean;
  formatter: (value: any, context: FormatterContex) => string;
};

const timeFormmatter = (value: string) => dayjs(value).format("HH:mm");

const valuesDescriptors: Record<SunriseSunsetKeys, ValueDescriptor> = {
  sunrise: {
    label: "Sunrise",
    showDefault: true,
    formatter: timeFormmatter,
  },
  sunset: {
    label: "Sunset",
    showDefault: true,
    formatter: timeFormmatter,
  },
  solarNoon: {
    label: "Solar noon",
    showDefault: false,
    formatter: timeFormmatter,
  },
  dayLength: {
    label: "Day length",
    showDefault: false,
    formatter: (value: number, { locale }) => dayjs.duration(value, "s").locale(locale).humanize(),
  },
  civilTwilightBegin: {
    label: "Civil twilight begin",
    showDefault: false,
    formatter: timeFormmatter,
  },
  civilTwilightEnd: {
    label: "Civil twilight end",
    showDefault: false,
    formatter: timeFormmatter,
  },
  nauticalTwilightBegin: {
    label: "Nautical twilight begin",
    showDefault: false,
    formatter: timeFormmatter,
  },
  nauticalTwilightEnd: {
    label: "Nautical twilight end",
    showDefault: false,
    formatter: timeFormmatter,
  },
  astronomicalTwilightBegin: {
    label: "Astronomical twilight begin",
    showDefault: false,
    formatter: timeFormmatter,
  },
  astronomicalTwilightEnd: {
    label: "Astronomical twilight end",
    showDefault: false,
    formatter: timeFormmatter,
  },
};

type Layout = "vertical" | "horizontal";

export class SunriseSunsetSettings extends BaseWidgetSettings {
  city: string = "Budapest";
  values: Record<string, boolean> = Object.fromEntries(
    Object.entries(valuesDescriptors).map(([key, desc]) => [key, desc.showDefault])
  );
  fontSize: string = "1.1em";
}

const dayInMsecs = 1000 * 60 * 60 * 24;

export type SunriseSunsetProps = CommonWidgetProps<SunriseSunsetSettings>;

export const SunriseSunset = (props: SunriseSunsetProps) => {
  const { config } = props;
  const rndProps = useRnd(config);
  const { locale } = useCurrentDashboard();

  const { data, refetch } = useSunriseSunsetQuery({ variables: { city: config.settings.city } });

  useInterval(() => {
    refetch();
  }, dayInMsecs);

  return (
    <RndFrame rndProps={rndProps}>
      <Box sx={{ p: 1 }}>
        <Box component="table" sx={{ fontSize: config.settings.fontSize, "& td": { p: 1 } }}>
          <tbody>
            {Object.entries(config.settings.values).map(([key, isShow]) => {
              if (!isShow) return null;
              const propName = key as SunriseSunsetKeys;
              return (
                <tr key={propName}>
                  <td>{valuesDescriptors[propName].label}:</td>
                  <td>
                    {valuesDescriptors[propName].formatter(data?.sunriseSunset[propName], {
                      locale,
                    })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Box>
      </Box>
      <WidgetMenu
        id={config.id}
        settings={config.settings}
        defaultOpen={!config.settings.city}
        settingsFormFields={[
          {
            name: "city",
            label: "City",
          },
          {
            name: "fontSize",
            label: "Font size",
          },
          {
            type: "checkboxList",
            name: "values",
            label: "Values to show",
            options: Object.entries(valuesDescriptors).map(([key, { label }]) => ({ value: key, label })),
          } as FormCheckboxListFieldDescriptor,
        ]}
      />
    </RndFrame>
  );
};
