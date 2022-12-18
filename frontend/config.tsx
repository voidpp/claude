import { createContext, useContext, useMemo } from "react";
import { useForceUpdate } from "./tools";
import { LocalStorageSchema, LocalStorageValue } from "./types";
import { createContextProviderComponent } from "./widgets";

function fetchItem(name: string, default_?: any) {
    const res = window.localStorage.getItem(name);
    return res === null ? default_ : JSON.parse(res);
}

const useAppConfigData = () => {
    const forceUpdate = useForceUpdate();

    const handler = useMemo(
        () => ({
            get: (target: Record<string, any>, name: string) => {
                return {
                    get value() {
                        return fetchItem(name, target[name]);
                    },
                    setValue: (value: any) => {
                        if (fetchItem(name) == value) return;
                        window.localStorage.setItem(name, JSON.stringify(value));
                        forceUpdate();
                    },
                } as LocalStorageValue<any>;
            },
        }),
        []
    );

    return new Proxy<LocalStorageSchema>({} as LocalStorageSchema, handler);
};

const AppConfigContext = createContext(undefined);

export const useAppConfig = () => useContext<LocalStorageSchema>(AppConfigContext);

export const AppConfigContextProvider = createContextProviderComponent(AppConfigContext, useAppConfigData);
