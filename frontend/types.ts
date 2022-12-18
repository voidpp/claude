export type LocalStorageValue<T> = {
    value: T;
    setValue: (value: T) => void;
};

export type LocalStorageSchema = {
    selectedDashboard: LocalStorageValue<string>;
};

export class BaseWidgetSettings {}

export interface BaseWidgetConfig {
    x: number;
    y: number;
    width: number;
    height: number;
    settings: BaseWidgetSettings;
}

export interface WidgetConfig extends BaseWidgetConfig {
    id: string;
    type: string;
    dashboardId: string;
}

export type CommonWidgetProps<T = any> = {
    config: Omit<WidgetConfig, "settings"> & { settings: T };
};
