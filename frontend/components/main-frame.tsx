import * as React from "react";
import { Notification } from "../notifications";
import { ControlBar } from "./control-bar";
import { Dashboard } from "./dashboard";

export const MainFrame = () => {
    return (
        <>
            <ControlBar />
            <Notification />
            <Dashboard />
        </>
    );
}
