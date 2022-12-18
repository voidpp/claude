import { createContext, useContext } from "react";
import {
    DashboardInput,
    useRemoveWidgetMutation,
    useSaveDashboardMutation,
    useSaveWidgetMutation,
    useSettingsQuery,
    Widget,
    WidgetInput,
} from "./graphql-types-and-hooks";
import { createContextProviderComponent } from "./widgets";

const useAppSettingsData = () => {
    const { data, refetch } = useSettingsQuery();
    const [saveDashboard] = useSaveDashboardMutation();
    const [saveWidget] = useSaveWidgetMutation();
    const [removeWidget] = useRemoveWidgetMutation();

    return {
        settings: data?.settings,
        refreshSettings: refetch,
        removeWidget: async (id: string, refetchSettings = true) => {
            const result = await removeWidget({ variables: { id } });
            if (refetchSettings) refetch();
            return result.data.removeWidget;
        },
        saveDashboard: async (data: DashboardInput, refetchSettings = true) => {
            const result = await saveDashboard({ variables: { data } });
            if (refetchSettings) refetch();
            return result.data.saveDashboard;
        },
        saveWidget: async (data: WidgetInput, refetchSettings = true) => {
            const result = await saveWidget({
                variables: { data: { ...data, settings: JSON.stringify(data.settings) } },
            });
            if (refetchSettings) refetch();
            return result.data.saveWidget;
        },
        getWidgetById: (id: string): Widget => {
            return data.settings.widgets.filter(widget => widget.id === id)[0];
        },
    };
};

const AppSettingsContext = createContext(undefined);

export const useAppSettings = () => useContext<ReturnType<typeof useAppSettingsData>>(AppSettingsContext);

export const AppSettingsContextProvider = createContextProviderComponent(AppSettingsContext, useAppSettingsData);
