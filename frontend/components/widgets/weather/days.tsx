import { DayForecast, PluginType, useDaysWeatherQuery, useSpecialDaysQuery } from "@/graphql-types-and-hooks";
import { useCurrentLocale, useInterval, usePluginOptions } from "@/hooks";
import { entries } from "@/tools";
import { BaseWidgetSettings, CommonWidgetProps } from "@/types";
import { IfComp } from "@/widgets";
import { SxProps } from "@mui/material";
import { Box } from "@mui/system";
import dayjs from "dayjs";
import * as React from "react";
import { LabelProps, Line, LineChart, YAxis } from "recharts";
import { specialDayTypeColors } from "../../calendar/tools";
import { RndFrame, useRnd } from "../../rnd";
import { WidgetMenu } from "../../widget-menu";
import { FormCheckboxListFieldDescriptor, FormSelectFieldDescriptor } from "../../widget-settings-dialog";

export type ShowableRows =
    | "dayNumber"
    | "dayText"
    | "dayImage"
    | "precipitationValue"
    | "precipitationProbability"
    | "temperatureChart";

const dataRowHeightRatio: { [key in ShowableRows]: number } = {
    dayNumber: 0.06,
    dayText: 0.06,
    dayImage: 0.9,
    precipitationValue: 0.035,
    precipitationProbability: 0.035,
    temperatureChart: 0.8,
};

function getRowShownRatio(baseRatio: number, { config }: CommonWidgetProps<DaysWeatherSettings>): number {
    let ratio = baseRatio;
    for (const [key, val] of entries(dataRowHeightRatio)) {
        if (!config.settings.rowsToShow[key]) ratio += baseRatio * 2 * val;
    }
    return ratio;
}

export class DaysWeatherSettings extends BaseWidgetSettings {
    city: string = "Budapest";
    pollInterval: number = 60 * 10;
    days: number = 7;
    providerId: string = "";
    rowsToShow: { [key in ShowableRows]: boolean } = {
        dayNumber: true,
        dayText: true,
        dayImage: true,
        precipitationValue: true,
        precipitationProbability: true,
        temperatureChart: true,
    };
}

const CustomizedLabel = ({ x, y, value }: LabelProps) => (
    <text x={x} y={y} dy={"-0.5em"} fill={"white"} textAnchor="middle">
        {value}
    </text>
);

export type DaysWeatherProps = CommonWidgetProps<DaysWeatherSettings>;

const useDayColor = (date: string, locale: string) => {
    const { data } = useSpecialDaysQuery();
    const type = React.useMemo(() => {
        return data?.settings.specialDays.filter(sd => sd.date == date && sd.locale == locale)[0]?.type;
    }, [data?.settings.specialDays, date]);

    if (type) return specialDayTypeColors[type];

    const day = dayjs(date);

    if (day.day() == 6) return "green";
    if (day.day() == 0) return "red";
};

function DayInfoCell({ day, rowsToShow }: { day: DayForecast; rowsToShow: { [key in ShowableRows]: boolean } }) {
    const locale = useCurrentLocale();
    const color = useDayColor(day.date, locale);

    return (
        <Box>
            <IfComp cond={rowsToShow.dayNumber}>
                <Box sx={{ color }}>{day.day}</Box>
            </IfComp>
            <IfComp cond={rowsToShow.dayText}>
                <Box sx={{ color }}>{dayjs(day.date).locale(locale).format("dd")}</Box>
            </IfComp>
            <IfComp cond={rowsToShow.dayImage}>
                <Box>
                    <img style={{ width: "2.5em" }} src={day.image} />
                </Box>
            </IfComp>
            <IfComp cond={rowsToShow.precipitationValue && day.precipitation.value}>
                <div>{`${day.precipitation.value} mm`}</div>
            </IfComp>
        </Box>
    );
}

const headerStyle: SxProps = {
    paddingTop: "0.6em",
    display: "flex",
    justifyContent: "space-around",
    "& > div": {
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
    },
};

export const DaysWeather = (props: DaysWeatherProps) => {
    const { config } = props;
    const { rowsToShow } = config.settings;
    const rndProps = useRnd(config);
    const providerOptions = usePluginOptions(PluginType.Weather);

    const { data, refetch } = useDaysWeatherQuery({
        variables: { city: config.settings.city, providerId: config.settings.providerId },
    });

    function onBeforeSettingsSubmit(settings: DaysWeatherSettings) {
        if (settings.city != config.settings.city) refetch();
    }

    useInterval(refetch, config.settings.pollInterval * 1000);

    const displayData = data?.weather.days.slice(0, config.settings.days) ?? [];

    const baseForMargin = config.height * getRowShownRatio(0.06, props);
    const vertMargin = config.width / config.settings.days / 2;

    return (
        <RndFrame rndProps={rndProps}>
            <Box>
                <IfComp cond={data && providerOptions.length}>
                    <Box sx={headerStyle}>
                        {displayData.map(day => (
                            <DayInfoCell key={day.date} day={day} rowsToShow={rowsToShow} />
                        ))}
                    </Box>
                    <IfComp cond={rowsToShow.temperatureChart}>
                        <LineChart
                            data={displayData.map(day => day.temperature)}
                            width={config.width}
                            height={config.height * getRowShownRatio(0.54, props)}
                            margin={{
                                top: baseForMargin * 1.3,
                                right: vertMargin,
                                bottom: baseForMargin * 0.2,
                                left: vertMargin,
                            }}
                        >
                            <YAxis type="number" domain={["dataMin", "dataMax"]} hide />
                            <Line type="monotone" dataKey="max" stroke="red" strokeWidth={3} label={CustomizedLabel} />
                            <Line type="monotone" dataKey="min" stroke="blue" strokeWidth={3} label={CustomizedLabel} />
                        </LineChart>
                    </IfComp>
                </IfComp>
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
                        name: "days",
                        label: "Days to show",
                    },
                    {
                        name: "pollInterval",
                        label: "Interval (seconds)",
                    },
                    {
                        type: "checkboxList",
                        name: "rowsToShow",
                        label: "Show data rows",
                        options: [
                            { value: "dayNumber", label: "Day number" },
                            { value: "dayText", label: "Day text" },
                            { value: "dayImage", label: "Day image" },
                            { value: "precipitationValue", label: "Precipitation value" },
                            // { value: "precipitationProbability", label: "Precipitation probability" },
                            { value: "temperatureChart", label: "Temperature chart" },
                        ],
                    } as FormCheckboxListFieldDescriptor,
                ]}
            />
        </RndFrame>
    );
};
