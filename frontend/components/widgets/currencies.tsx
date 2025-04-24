import currencies from "@/currencies.json";
import { useRequestCacheLazyQuery } from "@/graphql-types-and-hooks";
import { useInterval } from "@/hooks";
import { useNotifications } from "@/notifications";
import { useAppSettings } from "@/settings";
import { BaseWidgetSettings, CommonWidgetProps, CurrencyDesc } from "@/types";
import { Box, Typography } from "@mui/material";
import * as React from "react";
import { useEffect, useState } from "react";
import { RndFrame, useRnd } from "../rnd";
import { WidgetMenu } from "../widget-menu";
import { FormDurationFieldDescriptor, FormSelectFieldDescriptor } from "../widget-settings/types";

type CurrencyKey = keyof typeof currencies.data;

const currenciesOptions = Object.values(currencies.data).map((desc: CurrencyDesc) => ({
  value: desc.code,
  label: `${desc.code} (${desc.name})`,
}));

export class CurrenciesSettings extends BaseWidgetSettings {
  accountId: string = "";
  pollInterval: number = 60 * 60 * 24;
  base: CurrencyKey = Object.keys(currencies)[0] as CurrencyKey;
  currencies: CurrencyKey[] = [];
  cacheExpiryTime: number = 0;
}

export type CurrenciesProps = CommonWidgetProps<CurrenciesSettings>;

const baseAPIURL = "https://api.freecurrencyapi.com/v1/latest";

type ApiResult = {
  data?: Record<string, number>;
  message?: string;
};

export const Currencies = (props: CurrenciesProps) => {
  const { config } = props;
  const { settings } = useAppSettings();
  const rndProps = useRnd(config);
  const [data, setData] = useState<ApiResult["data"]>();
  const [getCachedData] = useRequestCacheLazyQuery();
  const { showNotification } = useNotifications();

  const onBeforeSettingsSubmit = (data: CurrenciesSettings) => {};
  const account = settings?.freeCurrencyApiAccounts?.filter(acc => acc.id === config.settings.accountId)[0];

  const fetchData = async () => {
    if (!account) return;
    const params = new URLSearchParams();
    params.set("base_currency", config.settings.base);
    params.set("currencies", config.settings.currencies.join(","));
    const url = baseAPIURL + "?" + params.toString();
    let result: ApiResult = {};
    let responseStatusCode: number = 200;
    if (config.settings.cacheExpiryTime > 0) {
      const response = await getCachedData({
        variables: {
          url,
          cacheSeconds: config.settings.cacheExpiryTime,
          headers: [{ name: "apikey", value: account.apiKey }],
        },
        fetchPolicy: "cache-and-network",
      });
      result = JSON.parse(response.data.requestCache.content);
      responseStatusCode = response.data.requestCache.code;
    } else {
      const response = await fetch(url, { headers: { apikey: account.apiKey } });
      responseStatusCode = response.status;
      result = await response.json();
    }
    if (responseStatusCode == 200) setData(result.data);
    else showNotification(`Currencies: ${result.message}`, "error");
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
            label: "Refresh interval",
            type: "duration",
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
          {
            name: "cacheExpiryTime",
            label: "Cache via Claude API",
            type: "duration",
            showEnableButton: true,
            default: 60 * 60 * 6,
          } as FormDurationFieldDescriptor,
        ]}
      />
    </RndFrame>
  );
};
