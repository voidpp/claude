import { BaseWidgetSettings, CommonWidgetProps } from "@/types";
import { IfComp } from "@/widgets";
import { ApolloClient, useMutation, useSubscription } from "@apollo/client";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import PlayCircleOutline from "@mui/icons-material/PlayCircleOutline";
import StopCircleOutlined from "@mui/icons-material/StopCircleOutlined";
import { Box, IconButton, SxProps } from "@mui/material";
import * as React from "react";
import { RndFrame, useRnd } from "../../rnd";
import { WidgetMenu } from "../../widget-menu";
import { FormNumberFieldDescriptor } from "../../widget-settings-dialog";
import { useBuckClient as useBuckApolloClient } from "./hooks";
import {
    runningTimersSubscription,
    RunningTimersSubscription,
    RunningTimersSubscription_runningTimers,
    TimerEventsSubscription,
    timerEventsSubscription,
    TimerEventsSubscription_timerEvents_timer,
    TimerEventType,
    TimerOperation,
    TimerOperationMutation,
    timerOperationMutation,
    TimerOperationMutationVariables,
    TimerState,
} from "./queries";

export class BuckSettings extends BaseWidgetSettings {
    host: string = "";
    port: number = 9000;
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

const RunnningTimer = ({
    timer,
    client,
}: {
    timer: RunningTimersSubscription_runningTimers;
    client: ApolloClient<object>;
}) => {
    const [operateTimer] = useMutation<TimerOperationMutation, TimerOperationMutationVariables>(
        timerOperationMutation,
        { client }
    );

    return (
        <Box sx={{ display: "flex", alignItems: "center", p: 1 }}>
            <IfComp cond={timer.state === TimerState.STARTED}>
                <IconButton
                    onClick={() => operateTimer({ variables: { id: timer.id, operation: TimerOperation.PAUSE } })}
                >
                    <PauseCircleOutlineIcon sx={iconStyle} />
                </IconButton>
            </IfComp>
            <IfComp cond={timer.state === TimerState.PAUSED}>
                <IconButton
                    onClick={() => operateTimer({ variables: { id: timer.id, operation: TimerOperation.UNPAUSE } })}
                >
                    <PlayCircleOutline sx={iconStyle} />
                </IconButton>
            </IfComp>
            <IconButton onClick={() => operateTimer({ variables: { id: timer.id, operation: TimerOperation.STOP } })}>
                <StopCircleOutlined sx={iconStyle} />
            </IconButton>
            <Box sx={{ ml: 1 }}>
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
};

const activeAlarmContainerStyle: SxProps = {
    position: "absolute",
    left: 0,
    top: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(255,0,0,0.2)",
    backdropFilter: "blur(6px)",
    padding: 2,
    fontSize: "2em",
    display: "flex",
    alignItems: "center",
};

const ActiveAlarms = ({
    timers,
    client,
}: {
    timers: TimerEventsSubscription_timerEvents_timer[];
    client: ApolloClient<object>;
}) => {
    const [operateTimer] = useMutation<TimerOperationMutation, TimerOperationMutationVariables>(
        timerOperationMutation,
        { client }
    );

    if (timers.length == 0) return null;

    return (
        <Box sx={activeAlarmContainerStyle}>
            <NotificationsActiveIcon sx={{ width: 100, height: 100 }} />
            <Box sx={{ pl: 2, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
                {timers.map(timer => (
                    <React.Fragment key={timer.id}>
                        <Box>{timer.name?.length ? timer.name : timer.length}</Box>
                        <StopCircleOutlined
                            sx={{ width: 48, height: 48, cursor: "pointer", "&:hover": { opacity: 0.7 } }}
                            onClick={() => {
                                operateTimer({ variables: { id: timer.id, operation: TimerOperation.CLEAR_ALARM } });
                            }}
                        />
                    </React.Fragment>
                ))}
            </Box>
        </Box>
    );
};

export const Buck = ({ config }: BuckProps) => {
    const client = useBuckApolloClient(config.settings.host, config.settings.port);
    const rndProps = useRnd(config, 10);
    const [activeAlarms, setActiveAlarms] = React.useState<TimerEventsSubscription_timerEvents_timer[]>([]);
    const { data } = useSubscription<RunningTimersSubscription>(runningTimersSubscription, { client });
    useSubscription<TimerEventsSubscription>(timerEventsSubscription, {
        client,
        onData: options => {
            for (const event of options.data.data.timerEvents) {
                if (event.type === TimerEventType.ALARM) setActiveAlarms([...activeAlarms, event.timer]);
                else if (event.type === TimerEventType.CLEAR_ALARM)
                    setActiveAlarms(activeAlarms.filter(timer => timer.id !== event.timer.id));
            }
        },
    });

    return (
        <RndFrame rndProps={rndProps} sx={{ ...(activeAlarms.length ? { backdropFilter: "unset" } : {}) }}>
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
                    <RunnningTimer timer={timer} key={timer.id} client={client} />
                ))}
            </Box>
            <ActiveAlarms timers={activeAlarms} client={client} />
            <WidgetMenu
                id={config.id}
                settings={config.settings}
                defaultOpen={!config.settings.host}
                settingsFormFields={[
                    {
                        name: "host",
                        label: "Host",
                        required: true,
                    },
                    {
                        name: "port",
                        label: "Port",
                        required: true,
                        min: 0,
                        max: 65565,
                    } as FormNumberFieldDescriptor,
                ]}
            />
        </RndFrame>
    );
};
