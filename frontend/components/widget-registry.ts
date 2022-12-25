import { BaseWidgetSettings } from "../types";
import { Clock, ClockSettings } from "./widgets/clock";
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
};
