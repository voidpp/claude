import { useState } from "react";

export const useBoolState = (defaultValue = false): [boolean, () => void, () => void, () => void] => {
    const [value, setValue] = useState(defaultValue);

    return [value, () => setValue(true), () => setValue(false), () => setValue(!value)]
}

export function useForceUpdate() {
    const [_, setValue] = useState([]);
    return () => setValue([]);
}

export function copyObject<T extends object>(data: T, excludedFields?: Array<keyof T>): T {
    return Object.entries(data).reduce((prev: T, [key, value]) => {
        if (excludedFields?.includes(key as keyof T))
            return prev;
        prev[key as keyof T] = value;
        return prev;
    }, {} as T);
}
