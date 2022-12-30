import { BaseWidgetSettings, CommonWidgetProps } from "@/types";
import { useSubscription } from "@apollo/client";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import PlayCircleOutline from "@mui/icons-material/PlayCircleOutline";
import { Box, SxProps } from "@mui/material";
import * as React from "react";
import { IfComp } from "../../../widgets";
import { RndFrame, useRnd } from "../../rnd";
import { WidgetMenu } from "../../widget-menu";
import { useLocalApolloClient as useBuckApolloClient } from "./hooks";
import {
    runningTimersSubscription,
    RunningTimersSubscription,
    RunningTimersSubscription_runningTimers,
    TimerState,
} from "./subscription";

export class BuckSettings extends BaseWidgetSettings {
    url: string = "";
}

export type BuckProps = CommonWidgetProps<BuckSettings>;

export const Timedelta = ({ value, sx }: { value: number; sx?: SxProps }) => {
    const hours = Math.floor(value / 3600);
    const minutes = Math.floor((value - hours * 3600) / 60);
    const seconds = value % 60;

    return (
        <Box component="span" sx={sx}>
            {hours ? `${hours}:` : ""}
            {minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
        </Box>
    );
};

const iconStyle: SxProps = {
    width: 64,
    height: 64,
};

const RunnningTimer = ({ timer }: { timer: RunningTimersSubscription_runningTimers }) => (
    <Box sx={{ display: "flex", alignItems: "center", p: 1 }}>
        <IfComp cond={timer.state === TimerState.STARTED}>
            <PlayCircleOutline sx={iconStyle} />
        </IfComp>
        <IfComp cond={timer.state === TimerState.PAUSED}>
            <PauseCircleOutlineIcon sx={iconStyle} />
        </IfComp>
        <Box sx={{ ml: 2 }}>
            <Box sx={{ fontSize: "1.4em" }}>{timer.name}</Box>
            <Box sx={{ fontSize: "0.7em" }}>{timer.origLength}</Box>
        </Box>
        <Box sx={{ ml: 2 }}>
            {timer.remainingTimes.map((time, idx) => (
                <Timedelta key={idx} value={time} sx={{ fontSize: idx == 0 ? "2em" : "0.8em", mr: 0.5 }} />
            ))}
        </Box>
    </Box>
);

export const Buck = ({ config }: BuckProps) => {
    const client = useBuckApolloClient(config.settings.url);
    const rndProps = useRnd(config, 10);

    const { data } = useSubscription<RunningTimersSubscription>(runningTimersSubscription, { client });

    return (
        <RndFrame rndProps={rndProps}>
            <Box sx={{ height: "100%" }}>
                <IfComp cond={!data?.runningTimers.length}>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "100%",
                            fontStyle: "italic",
                            fontSize: "1.3em",
                        }}
                    >
                        There are no running Buck timers.
                    </Box>
                </IfComp>
                {data?.runningTimers.map(timer => (
                    <RunnningTimer timer={timer} key={timer.id} />
                ))}
            </Box>
            <WidgetMenu
                id={config.id}
                settings={config.settings}
                defaultOpen={!config.settings.url}
                settingsFormFields={[
                    {
                        name: "url",
                        label: "URL",
                        required: true,
                    },
                ]}
            />
        </RndFrame>
    );
};
