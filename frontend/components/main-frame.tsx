import * as React from "react";
import { Notification } from "@/notifications";
import { Dashboard } from "./dashboard";

import { gql, useApolloClient } from "@apollo/client";
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router-dom";
import { Admin } from "@/admin/admin";
import { Housekeeping } from "@/admin/cache";
import { DashboardEditPage } from "@/admin/dashboards/dashboard-edit-page";
import { DashboardsPage } from "@/admin/dashboards/dashboards-page";
import { FreeCurrencyAPIAccountsPage } from "@/admin/free-currency-api-accounts/free-currency-api-accounts-page";
import { Plugins } from "@/admin/plugins/page";
import { SpecialDaysPage } from "@/admin/special-days/special-days-page";
import { mainSubscriptionClient } from "@/client";
import { useSubscriptionClientStatus } from "@/subscription-client-tools";
import { PluginEditPage } from "@/admin/plugins/edit-page";
import { HomeAssistant } from "@/admin/home-assistant";
import { useAppConfig } from "@/config";
import { useVersionLazyQuery, useVersionQuery } from "@/graphql-types-and-hooks";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/">
      <Route path="" element={<Dashboard />} />
      <Route path="admin" element={<Admin />}>
        <Route path="plugins" element={<Plugins />} />
        <Route path="plugins/edit/:pluginId" element={<PluginEditPage />} />
        <Route path="housekeeping" element={<Housekeeping />} />
        <Route path="home-assistant" element={<HomeAssistant />} />
        <Route path="dashboards" element={<DashboardsPage />} />
        <Route path="dashboards/:dashboardId" element={<DashboardEditPage />} />
        <Route path="free-currency-api-accounts" element={<FreeCurrencyAPIAccountsPage />} />
        <Route path="special-days" element={<SpecialDaysPage />} />
      </Route>
    </Route>
  )
);

const versionQuery = gql`
  query VersionQuery {
    version
  }
`;

const useAppVersionMatchForce = () => {
  const status = useSubscriptionClientStatus(mainSubscriptionClient);
  const { appVersion } = useAppConfig();
  const [fetchVersion] = useVersionLazyQuery();

  React.useEffect(() => {
    if (status !== "connected") return;

    fetchVersion().then(response => {
      if (response.data.version !== appVersion.value) {
        appVersion.setValue(response.data.version);
        window.location.reload();
      }
    });
  }, [status]);
};

export const MainFrame = () => {
  useAppVersionMatchForce();

  return (
    <>
      <Notification />
      <RouterProvider router={router} />
    </>
  );
};
