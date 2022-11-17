import { createContext, useContext } from "react";
import { DashboardInput, useSaveDashboardMutation, useSettingsQuery } from "./graphql-types-and-hooks";
import { createContextProviderComponent } from "./widgets";



const useAppSettingsData = () => {
    const { data, refetch } = useSettingsQuery();
    const [saveDashboard] = useSaveDashboardMutation({ onCompleted: () => refetch() });

    return {
        settings: data?.settings,
        refreshSettings: refetch,
        saveDashboard: async (data: DashboardInput) => {
            const result = await saveDashboard({ variables: { data } });
            return result.data.saveDashboard;
        },
    };
}


const AppSettingsContext = createContext(undefined);

export const useAppSettings = () => useContext<ReturnType<typeof useAppSettingsData>>(AppSettingsContext);

export const AppSettingsContextProvider = createContextProviderComponent(AppSettingsContext, useAppSettingsData);
