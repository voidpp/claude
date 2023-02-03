import { HourForecast, PluginType, useHoursWeatherQuery } from "@/graphql-types-and-hooks";
import { useInterval, usePluginOptions } from "@/hooks";
import { BaseWidgetSettings, CommonWidgetProps } from "@/types";
import { Box, SxProps } from "@mui/system";
import * as React from "react";
import { LabelProps, Line, LineChart, YAxis } from "recharts";
import { RndFrame, useRnd } from "../../rnd";
import { WidgetMenu } from "../../widget-menu";
import { FormNumberFieldDescriptor, FormSelectFieldDescriptor } from "../../widget-settings-dialog";

export class HoursWeatherSettings extends BaseWidgetSettings {
    city: string = "Budapest";
    pollInterval: number = 60 * 10;
    providerId: string = "";
    hours: number = 24;
}

export type HoursWeatherProps = CommonWidgetProps<HoursWeatherSettings>;

const CustomizedLabel = ({ x, y, value }: LabelProps) => (
    <text x={x} y={y} dy={"-0.5em"} fill={"white"} textAnchor="middle">
        {value}
    </text>
);

function HourInfoCell({ data }: { data: HourForecast }) {
    const rootStyle: SxProps = {
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
    };
    return (
        <Box sx={rootStyle}>
            <Box sx={{ fontSize: "0.8em" }}>{data.hour}:00</Box>
            <Box>
                <img style={{ width: "2.5em" }} src={data.image} />
            </Box>
        </Box>
    );
}

export const HoursWeather = (props: HoursWeatherProps) => {
    const { config } = props;
    const rndProps = useRnd(config, 10);
    const providerOptions = usePluginOptions(PluginType.Weather);

    const { data, refetch } = useHoursWeatherQuery({
        variables: { city: config.settings.city, providerId: config.settings.providerId },
    });

    function onBeforeSettingsSubmit(settings: HoursWeatherSettings) {
        if (settings.city != config.settings.city) refetch();
    }

    useInterval(refetch, config.settings.pollInterval * 1000);

    const displayData = data?.weather.hours.slice(0, config.settings.hours) ?? [];

    return (
        <RndFrame rndProps={rndProps}>
            <Box>
                <Box sx={{ paddingTop: "0.6em", display: "flex", justifyContent: "space-around" }}>
                    {displayData.map((data, idx) => (
                        <HourInfoCell key={idx} data={data} />
                    ))}
                </Box>
                <LineChart
                    data={displayData}
                    width={config.width}
                    height={config.height - 70}
                    margin={{
                        top: 30,
                        right: 20,
                        bottom: 20,
                        left: 20,
                    }}
                >
                    <YAxis type="number" domain={["dataMin", "dataMax"]} hide />
                    <Line
                        type="monotone"
                        dataKey="temperature"
                        stroke="green"
                        strokeWidth={3}
                        label={CustomizedLabel}
                    />
                </LineChart>
            </Box>
            <WidgetMenu
                id={config.id}
                onBeforeSubmit={onBeforeSettingsSubmit}
                settings={config.settings}
                defaultOpen={!config.settings.providerId}
                settingsFormFields={[
                    {
                        name: "providerId",
                        label: "Provider",
                        type: "select",
                        default: "",
                        options: providerOptions,
                    } as FormSelectFieldDescriptor,
                    {
                        name: "city",
                        label: "City",
                    },
                    {
                        name: "hours",
                        label: "Hours to show",
                        min: 1,
                        max: 36,
                    } as FormNumberFieldDescriptor,
                    {
                        name: "pollInterval",
                        label: "Interval (seconds)",
                    },
                ]}
            />
        </RndFrame>
    );
};
