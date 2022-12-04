import { BaseWidgetSettings } from "../types"
import { Clock, ClockSettings } from "./widgets/clock"


export type WidgetRegistry = {
    [s: string]: {
        factory: (props: any) => JSX.Element,
        title: string,
        settingsType: typeof BaseWidgetSettings,
        defaultSize: { w: number, h: number },
    }
}

export const widgetRegistry: WidgetRegistry = {
    clock: {
        factory: Clock,
        title: 'Clock',
        settingsType: ClockSettings,
        defaultSize: { w: 500, h: 200 },
    },
}