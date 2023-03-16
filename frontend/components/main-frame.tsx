import * as React from "react";
import { Notification } from "../notifications";
import { Dashboard } from "./dashboard";

import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router-dom";
import { Admin } from "../admin/admin";
import { Housekeeping } from "../admin/cache";
import { DashboardEditPage } from "../admin/dashboards/dashboard-edit-page";
import { DashboardsPage } from "../admin/dashboards/dashboards-page";
import { FreeCurrencyAPIAccountsPage } from "../admin/free-currency-api-accounts/free-currency-api-accounts-page";
import { Plugins } from "../admin/plugins/page";
import { SpecialDaysPage } from "../admin/special-days/special-days-page";

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/">
            <Route path="" element={<Dashboard />} />
            <Route path="admin" element={<Admin />}>
                <Route path="plugins" element={<Plugins />} />
                <Route path="housekeeping" element={<Housekeeping />} />
                <Route path="dashboards" element={<DashboardsPage />} />
                <Route path="dashboards/:dashboardId" element={<DashboardEditPage />} />
                <Route path="free-currency-api-accounts" element={<FreeCurrencyAPIAccountsPage />} />
                <Route path="special-days" element={<SpecialDaysPage />} />
            </Route>
        </Route>
    )
);

export const MainFrame = () => {
    return (
        <>
            <Notification />
            <RouterProvider router={router} />
        </>
    );
};
