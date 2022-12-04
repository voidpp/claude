import { createContext, useContext } from "react";
import { DashboardInput, useSaveDashboardMutation, useSaveWidgetMutation, useSettingsQuery, WidgetInput } from "./graphql-types-and-hooks";
import { createContextProviderComponent } from "./widgets";



const useAppSettingsData = () => {
    const { data, refetch } = useSettingsQuery();
    const [saveDashboard] = useSaveDashboardMutation();
    const [saveWidget] = useSaveWidgetMutation()

    return {
        settings: data?.settings,
        refreshSettings: refetch,
        saveDashboard: async (data: DashboardInput, refetchSettings = true) => {
            const result = await saveDashboard({ variables: { data } });
            if (refetchSettings)
                refetch();
            return result.data.saveDashboard;
        },
        saveWidget: async (data: WidgetInput, refetchSettings = true) => {
            const result = await saveWidget({ variables: { data: { ...data, settings: JSON.stringify(data.settings) } } });
            if (refetchSettings)
                refetch();
            return result.data.saveWidget;
        },
    };
}


const AppSettingsContext = createContext(undefined);

export const useAppSettings = () => useContext<ReturnType<typeof useAppSettingsData>>(AppSettingsContext);

export const AppSettingsContextProvider = createContextProviderComponent(AppSettingsContext, useAppSettingsData);
