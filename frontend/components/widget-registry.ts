import { BaseWidgetSettings } from "../types";
import { Buck, BuckSettings } from "./widgets/buck/buck";
import { Calendar, CalendarSettings } from "./widgets/calendar";
import { Clock, ClockSettings } from "./widgets/clock";
import { Currencies, CurrenciesSettings } from "./widgets/currencies";
import { DayCounter, DayCounterSettings } from "./widgets/day-counter";
import { Gallery, GallerySettings } from "./widgets/gallery";
import { HAEntityList, HAEntityListSettings } from "./widgets/home-assistant/ha-entity-list";
import { HAGauge, HAGaugeSettings } from "./widgets/home-assistant/ha-gauge";
import {
  GoogleCalendarEventsSettings,
  HAGoogleCalendarEvents,
} from "./widgets/home-assistant/ha-google-calendar-events";
import {
  HACSBambuLabPrintProgress,
  HACSBambuLabPrintProgressSettings,
} from "./widgets/home-assistant/hacs-bl-print-progress";
import { InfluxTable, InfluxTableSettings } from "./widgets/influx-table";
import { ServerStatus, ServerStatusSettings } from "./widgets/server-status";
import { StorageStatus, StorageStatusSettings } from "./widgets/storage-status";
import { SunriseSunset, SunriseSunsetSettings } from "./widgets/sunrise-sunset";
import { CurrentWeather, CurrentWeatherSettings } from "./widgets/weather/current";
import { DaysWeather, DaysWeatherSettings } from "./widgets/weather/days";
import { HoursWeather, HoursWeatherSettings } from "./widgets/weather/hours";

export type WidgetRegistryEntry = {
  factory: (props: any) => JSX.Element;
  settingsType: typeof BaseWidgetSettings;
  defaultSize: { w: number; h: number };
};

export const widgetRegistry = {
  buck: {
    factory: Buck,
    settingsType: BuckSettings,
    defaultSize: { w: 500, h: 200 },
  },
  calendar: {
    factory: Calendar,
    settingsType: CalendarSettings,
    defaultSize: { w: 250, h: 250 },
  },
  clock: {
    factory: Clock,
    settingsType: ClockSettings,
    defaultSize: { w: 500, h: 200 },
  },
  dayCounter: {
    factory: DayCounter,
    settingsType: DayCounterSettings,
    defaultSize: { w: 200, h: 200 },
  },
  gallery: {
    factory: Gallery,
    settingsType: GallerySettings,
    defaultSize: { w: 500, h: 300 },
  },
  influxTable: {
    factory: InfluxTable,
    settingsType: InfluxTableSettings,
    defaultSize: { w: 300, h: 150 },
  },
  currentWeather: {
    factory: CurrentWeather,
    settingsType: CurrentWeatherSettings,
    defaultSize: { w: 220, h: 280 },
  },
  currencies: {
    factory: Currencies,
    settingsType: CurrenciesSettings,
    defaultSize: { w: 300, h: 200 },
  },
  daysWeather: {
    factory: DaysWeather,

    settingsType: DaysWeatherSettings,
    defaultSize: { w: 400, h: 200 },
  },
  hoursWeather: {
    factory: HoursWeather,
    settingsType: HoursWeatherSettings,
    defaultSize: { w: 400, h: 200 },
  },
  serverStatus: {
    factory: ServerStatus,
    settingsType: ServerStatusSettings,
    defaultSize: { w: 400, h: 200 },
  },
  sunriseSunset: {
    factory: SunriseSunset,
    settingsType: SunriseSunsetSettings,
    defaultSize: { w: 200, h: 100 },
  },
  storageStatus: {
    factory: StorageStatus,
    settingsType: StorageStatusSettings,
    defaultSize: { w: 400, h: 200 },
  },
  googleCalendar: {
    factory: HAGoogleCalendarEvents,
    settingsType: GoogleCalendarEventsSettings,
    defaultSize: { w: 250, h: 250 },
  },
  hacsBambuLabPrintProgress: {
    factory: HACSBambuLabPrintProgress,
    settingsType: HACSBambuLabPrintProgressSettings,
    defaultSize: { w: 500, h: 110 },
  },
  haGauge: {
    factory: HAGauge,
    settingsType: HAGaugeSettings,
    defaultSize: { w: 400, h: 200 },
  },
  haEntityList: {
    factory: HAEntityList,
    settingsType: HAEntityListSettings,
    defaultSize: { w: 400, h: 200 },
  },
} satisfies Record<string, WidgetRegistryEntry>;

export type WidgetType = keyof typeof widgetRegistry;
