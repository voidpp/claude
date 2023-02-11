import { BaseWidgetSettings } from "../types";
import { Buck, BuckSettings } from "./widgets/buck/buck";
import { Calendar, CalendarSettings } from "./widgets/calendar";
import { Clock, ClockSettings } from "./widgets/clock";
import { DayCounter, DayCounterSettings } from "./widgets/day-counter";
import { Gallery, GallerySettings } from "./widgets/gallery";
import { InfluxTable, InfluxTableSettings } from "./widgets/influx-table";
import { ServerStatus } from "./widgets/server-status";
import { SunriseSunset, SunriseSunsetSettings } from "./widgets/sunrise-sunset";
import { CurrentWeather, CurrentWeatherSettings } from "./widgets/weather/current";
import { DaysWeather, DaysWeatherSettings } from "./widgets/weather/days";
import { HoursWeather, HoursWeatherSettings } from "./widgets/weather/hours";

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
    calendar: {
        factory: Calendar,
        title: "Calendar",
        settingsType: CalendarSettings,
        defaultSize: {w: 250, h: 250},
    },
    clock: {
        factory: Clock,
        title: "Clock",
        settingsType: ClockSettings,
        defaultSize: { w: 500, h: 200 },
    },
    dayCounter: {
        factory: DayCounter,
        title: "Day counter",
        settingsType: DayCounterSettings,
        defaultSize: { w: 200, h: 200 },
    },
    gallery: {
        factory: Gallery,
        title: "Gallery",
        settingsType: GallerySettings,
        defaultSize: { w: 500, h: 300 },
    },
    influxTable: {
        factory: InfluxTable,
        title: "Influx table",
        settingsType: InfluxTableSettings,
        defaultSize: {w: 300, h: 150},
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
    hoursWeather: {
        factory: HoursWeather,
        title: "Weather / hours",
        settingsType: HoursWeatherSettings,
        defaultSize: { w: 400, h: 200 },
    },    
    serverStatus: {
        factory: ServerStatus,
        title: "Server status",
        settingsType: HoursWeatherSettings,
        defaultSize: { w: 400, h: 200 },
    },
    sunriseSunset: {
        factory: SunriseSunset,
        title: "Sunrise-sunset",
        settingsType: SunriseSunsetSettings,
        defaultSize: {w: 200, h: 100},
    },
};
