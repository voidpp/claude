import currencies from "@/currencies.json";
import { useAppSettings } from "@/settings";
import { BaseWidgetSettings, CommonWidgetProps, CurrencyDesc } from "@/types";
import { Box, Typography } from "@mui/material";
import * as React from "react";
import { useEffect, useState } from "react";
import { useInterval } from "../../hooks";
import { RndFrame, useRnd } from "../rnd";
import { WidgetMenu } from "../widget-menu";
import { FormSelectFieldDescriptor } from "../widget-settings-dialog";

type CurrencyKey = keyof typeof currencies.data;

const currenciesOptions = Object.values(currencies.data).map((desc: CurrencyDesc) => ({
    value: desc.code,
    label: `${desc.code} (${desc.name})`,
}));

export class CurrenciesSettings extends BaseWidgetSettings {
    accountId: string = "";
    pollInterval: number = 60 * 60 * 24; //seconds
    base: CurrencyKey = Object.keys(currencies)[0] as CurrencyKey;
    currencies: CurrencyKey[] = [];
}

export type CurrenciesProps = CommonWidgetProps<CurrenciesSettings>;

const baseAPIURL = "https://api.freecurrencyapi.com/v1/latest";

type ApiResult = {
    data: Record<string, number>;
};

export const Currencies = (props: CurrenciesProps) => {
    const { config } = props;
    const { settings } = useAppSettings();
    const rndProps = useRnd(config);
    const [data, setData] = useState<ApiResult["data"]>();

    const onBeforeSettingsSubmit = (data: CurrenciesSettings) => {};
    const account = settings?.freeCurrencyApiAccounts?.filter(acc => acc.id === config.settings.accountId)[0];

    const fetchData = async () => {
        if (!account) return;
        const params = new URLSearchParams();
        params.set("base_currency", config.settings.base);
        params.set("currencies", config.settings.currencies.join(","));
        const response = await fetch(baseAPIURL + "?" + params.toString(), { headers: { apikey: account.apiKey } });
        const data = await response.json();
        setData(data.data);
    };

    useEffect(() => {
        fetchData();
    }, [JSON.stringify(config.settings)]);

    useInterval(
        () => {
            fetchData();
        },
        config.settings.pollInterval * 1000,
        !!account
    );

    const width = rndProps.size.width;

    return (
        <RndFrame rndProps={rndProps}>
            <Box>
                {!!account && (
                    <Box sx={{ m: 2 }}>
                        <Typography sx={{ fontSize: width * 0.07, textAlign: "center" }}>
                            {currencies.data[config.settings.base].name} ({config.settings.base})
                        </Typography>
                        <table cellSpacing={width * 0.03} style={{ margin: "0 auto", fontSize: width * 0.06 }}>
                            <tbody>
                                {config.settings.currencies?.map(name => (
                                    <tr key={name}>
                                        <td>
                                            {currencies.data[name].name} ({name})
                                        </td>
                                        <td>{data ? Math.round(1 / data[name]) : "..."}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Box>
                )}
            </Box>
            <WidgetMenu
                id={config.id}
                settings={config.settings}
                onBeforeSubmit={onBeforeSettingsSubmit}
                defaultOpen={!config.settings.accountId}
                settingsFormFields={[
                    {
                        name: "accountId",
                        label: "Account",
                        type: "select",
                        default: "",
                        options: settings.freeCurrencyApiAccounts.map(acc => ({ value: acc.id, label: acc.name })),
                    } as FormSelectFieldDescriptor,
                    {
                        name: "pollInterval",
                        label: "Interval (seconds)",
                    },
                    {
                        name: "base",
                        label: "Base",
                        type: "select",
                        default: currenciesOptions[0].value,
                        options: currenciesOptions,
                    } as FormSelectFieldDescriptor,
                    {
                        name: "currencies",
                        label: "Currencies",
                        type: "select",
                        default: [],
                        options: currenciesOptions,
                        multiple: true,
                    } as FormSelectFieldDescriptor,
                ]}
            />
        </RndFrame>
    );
};
