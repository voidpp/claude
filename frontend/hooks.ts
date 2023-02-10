import dayjs, { Dayjs } from "dayjs";
import { useEffect, useRef, useState } from "react";
import { specialDayTypeColors } from "./components/calendar/tools";
import { FormSelectFieldDescriptor } from "./components/widget-settings-dialog";
import { useAppConfig } from "./config";
import { Dashboard, PluginType, SpecialDayType, useSpecialDaysQuery } from "./graphql-types-and-hooks";
import { useAppSettings } from "./settings";

export function useInterval(callback: () => void, delay: number, enabled: boolean = true) {
    const savedCallback = useRef(callback);

    useEffect(() => {
        savedCallback.current = callback;
    });

    useEffect(() => {
        function tick() {
            if (enabled) savedCallback.current();
        }

        const id = setInterval(tick, delay);
        return () => clearInterval(id);
    }, [delay]);
}

/**
 * returns: [value, setValueToTrue, setValueToFalse, toggleValue]
 */
export const useBoolState = (defaultValue = false): [boolean, () => void, () => void, () => void] => {
    const [value, setValue] = useState(defaultValue);

    return [value, () => setValue(true), () => setValue(false), () => setValue(!value)];
};

export const usePluginOptions = (type: PluginType): FormSelectFieldDescriptor["options"] => {
    const { settings } = useAppSettings();

    const plugins = settings.plugins?.filter(plugin => plugin.type === type) ?? [];

    return plugins.map(plugin => ({ value: plugin.id, label: plugin.name }));
};

export const useCurrentLocale = () => {
    const { selectedDashboard } = useAppConfig();
    const { settings } = useAppSettings();

    return settings.dashboards.filter(d => d.id === selectedDashboard.value)[0]?.locale ?? "en";
};

export const useCurrentDashboard = (): Dashboard => {
    const { selectedDashboard } = useAppConfig();
    const { settings } = useAppSettings();

    return settings?.dashboards.filter(db => db.id === selectedDashboard.value)[0];
}


export const useSpecialDaysMap = (locale: string, year?: number, keyFormat = "YYYY-MM-DD"): Record<string, SpecialDayType> => {
    const { data } = useSpecialDaysQuery();

    return Object.fromEntries(
        data?.settings.specialDays
            .filter(sd => (year ? dayjs(sd.date).year() == year : true) && sd.locale == locale)
            .map(sd => [dayjs(sd.date).format(keyFormat), sd.type]) ?? []
    );
};

export const useDayColorGetter = (locale: string, year?: number) => {
    const specialDays = useSpecialDaysMap(locale, year);

    return (day: Dayjs) => {
        const type = specialDays[day.format("YYYY-MM-DD")];

        if (type) return specialDayTypeColors[type];

        if (day.day() == 6) return "green";
        if (day.day() == 0) return "red";
    };
};
