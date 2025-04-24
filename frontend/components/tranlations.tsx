import * as React from "react";
import { IntlProvider } from "react-intl";
import { useCurrentDashboard } from "../hooks";
import { messages } from "../translations";
import { Locales } from "../types";

export const Tranlations = ({ children }: { children: React.ReactNode }) => {
  const dashboard = useCurrentDashboard();
  const locale = dashboard?.locale ?? "en";
  const localizedMessages = messages[locale as Locales];

  return (
    <IntlProvider locale={locale} messages={localizedMessages}>
      {children}
    </IntlProvider>
  );
};
