import { useState } from "react";
import { CommonWidgetProps } from "./types";

export function useForceUpdate() {
    const [_, setValue] = useState([]);
    return () => setValue([]);
}

export function copyObject<T extends object>(data: T, excludedFields?: Array<keyof T>): T {
    return Object.entries(data).reduce((prev: T, [key, value]) => {
        if (excludedFields?.includes(key as keyof T)) return prev;
        prev[key as keyof T] = value;
        return prev;
    }, {} as T);
}

type WidgetStyleCallback<T = any> = (props: CommonWidgetProps<{}>) => T;

export namespace WidgetStyle {
    export function getRelativeSize(ratio: number): {
        width: WidgetStyleCallback<number>;
        height: WidgetStyleCallback<number>;
    } {
        return {
            width: (props: CommonWidgetProps<{}>) => props.config.width * ratio,
            height: (props: CommonWidgetProps<{}>) => props.config.height * ratio,
        };
    }
}

export type PickByValue<T, V> = Pick<T, { [K in keyof T]: T[K] extends V ? K : never }[keyof T]>;

export type Entries<T> = {
    [K in keyof T]: [keyof PickByValue<T, T[K]>, T[K]];
}[keyof T][];

export function entries<T>(data: T): Entries<T> {
    return Object.entries(data) as Entries<T>;
}
