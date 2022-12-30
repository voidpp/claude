import { BaseWidgetSettings } from "../types";
import { Buck, BuckSettings } from "./widgets/buck/buck";
import { Clock, ClockSettings } from "./widgets/clock";
import { ServerStatus, ServerStatusSettings } from "./widgets/server-status";
import { CurrentWeather, CurrentWeatherSettings } from "./widgets/weather/current";
import { DaysWeather, DaysWeatherSettings } from "./widgets/weather/days";

export type WidgetRegistry = {
    [s: string]: {
        factory: (props: any) => JSX.Element;
        title: string;
        settingsType: typeof BaseWidgetSettings;
        defaultSize: { w: number; h: number };
    };
};

export const widgetRegistry: WidgetRegistry = {
    buck: {
        factory: Buck,
        title: "Buck",
        settingsType: BuckSettings,
        defaultSize: { w: 500, h: 200 },
    },
    clock: {
        factory: Clock,
        title: "Clock",
        settingsType: ClockSettings,
        defaultSize: { w: 500, h: 200 },
    },
    currentWeather: {
        factory: CurrentWeather,
        title: "Weather / current",
        settingsType: CurrentWeatherSettings,
        defaultSize: { w: 220, h: 280 },
    },
    daysWeather: {
        factory: DaysWeather,
        title: "Weather / days",
        settingsType: DaysWeatherSettings,
        defaultSize: { w: 400, h: 200 },
    },
    serverStatus: {
        factory: ServerStatus,
        title: "Server status",
        settingsType: ServerStatusSettings,
        defaultSize: { w: 400, h: 200 },
    },
};
