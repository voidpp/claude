import { createContext, useContext, useState } from "react";
import {
  DashboardInput,
  FreeCurrencyApiAccountInput,
  HomeAssitantServerInput,
  LiveSettingsSubscription,
  PluginType,
  useLiveSettingsSubscription,
  useRemoveDashboardMutation,
  useRemoveFreeCurrencyApiAccountMutation,
  useRemovePluginMutation,
  useRemoveWidgetMutation,
  useSaveDashboardMutation,
  useSaveFreeCurrencyApiAccountMutation,
  useSaveHomeAssistantServerMutation,
  useSavePluginMutation,
  useSaveWidgetMutation,
  Widget,
  WidgetInput,
} from "./graphql-types-and-hooks";
import { createContextProviderComponent } from "./widgets";

const useAppSettingsData = () => {
  const [saveDashboard] = useSaveDashboardMutation();
  const [saveWidget] = useSaveWidgetMutation();
  const [removeWidget] = useRemoveWidgetMutation();
  const [savePlugin] = useSavePluginMutation();
  const [saveFreeCurrencyApiAccount] = useSaveFreeCurrencyApiAccountMutation();
  const [removeDashboard] = useRemoveDashboardMutation();
  const [removePlugin] = useRemovePluginMutation();
  const [removeFreeCurrencyApiAccount] = useRemoveFreeCurrencyApiAccountMutation();
  const [saveHomeAssistantServer] = useSaveHomeAssistantServerMutation();
  const [settings, setSettings] = useState<LiveSettingsSubscription["settings"]>(null);

  useLiveSettingsSubscription({
    onData: options => {
      setSettings(options.data.data.settings);
    },
  });

  return {
    settings,
    removeWidget: async (id: string) => {
      const result = await removeWidget({ variables: { id } });
      return result.data.removeWidget;
    },
    removeDashboard: async (id: string) => {
      const result = await removeDashboard({ variables: { id } });
      return result.data.removeDashboard;
    },
    removePlugin: async (id: string) => {
      const result = await removePlugin({ variables: { id } });
      return result.data.removePlugin;
    },
    removeFreeCurrencyApiAccount: async (id: string) => {
      const result = await removeFreeCurrencyApiAccount({ variables: { id } });
      return result.data.removeFreeCurrencyApiAccount;
    },
    saveDashboard: async (data: DashboardInput) => {
      const result = await saveDashboard({ variables: { data } });
      return result.data.saveDashboard;
    },
    saveFreeCurrencyApiAccount: async (data: FreeCurrencyApiAccountInput) => {
      const result = await saveFreeCurrencyApiAccount({ variables: { data } });
      return result.data.saveFreeCurrencyApiAccount;
    },
    saveHomeAssistantServer: async (data: HomeAssitantServerInput | null) => {
      const result = await saveHomeAssistantServer({ variables: { data } });
      return result.data.saveHomeAssistantServer;
    },
    saveWidget: async (data: WidgetInput) => {
      const result = await saveWidget({
        variables: { data: { ...data, settings: JSON.stringify(data.settings) } },
      });
      return result.data.saveWidget;
    },
    savePlugin: async (id: string, file: string, name: string, type: PluginType, className: string) => {
      const result = await savePlugin({
        variables: { id, file, name, type, className },
      });
      return result.data.savePlugin;
    },
    getWidgetById: (id: string): Widget => {
      return settings.widgets.filter(widget => widget.id === id)[0];
    },
  };
};

const AppSettingsContext = createContext(undefined);

export const useAppSettings = () => useContext<ReturnType<typeof useAppSettingsData>>(AppSettingsContext);

export const AppSettingsContextProvider = createContextProviderComponent(AppSettingsContext, useAppSettingsData);
