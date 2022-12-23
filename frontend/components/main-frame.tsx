import * as React from "react";
import { Notification } from "../notifications";
import { Dashboard } from "./dashboard";

import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router-dom";
import { Admin } from "../admin/admin";
import { Cache } from "../admin/cache";
import { DashboardEditPage } from "../admin/dashboards/dashboard-edit-page";
import { DashboardsPage } from "../admin/dashboards/dashboards-page";
import { Plugins } from "../admin/plugins/page";

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/">
            <Route path="" element={<Dashboard />} />
            <Route path="admin" element={<Admin />}>
                <Route path="plugins" element={<Plugins />} />
                <Route path="cache" element={<Cache />} />
                <Route path="dashboards" element={<DashboardsPage />} />
                <Route path="dashboards/:dashboardId" element={<DashboardEditPage />} />
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
