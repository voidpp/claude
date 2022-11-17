import * as React from "react";
import { Notification } from "../notifications";
import { ControlBar } from "./control-bar";

export const MainFrame = () => {
    return (
        <>
            <ControlBar />
            <Notification />
        </>
    );
}
