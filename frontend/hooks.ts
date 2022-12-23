import { useEffect, useRef, useState } from "react";
import { FormSelectFieldDescriptor } from "./components/widget-settings-dialog";
import { PluginType } from "./graphql-types-and-hooks";
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

    return plugins.map(plugin => ({ value: plugin.id, label: plugin.title }));
};
