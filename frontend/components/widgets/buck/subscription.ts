import { gql } from "@apollo/client";

export enum TimerEventType {
    ALARM = "ALARM",
    PAUSE = "PAUSE",
    START = "START",
    STOP = "STOP",
}

export enum TimerState {
    PAUSED = "PAUSED",
    STARTED = "STARTED",
}

export const timerEventsSubscription = gql`
    subscription TimerEventsSubscription {
        timerEvents {
            id
            time
            type
            timer {
                id
                length
                name
                soundFile
            }
        }
    }
`;

export interface TimerEventsSubscription_timerEvents_timer {
    __typename: "Timer";
    id: number;
    length: string;
    name: string | null;
    soundFile: string | null;
}

export interface TimerEventsSubscription_timerEvents {
    __typename: "TimerEvent";
    id: number;
    time: any | null;
    type: TimerEventType;
    timer: TimerEventsSubscription_timerEvents_timer | null;
}

export interface TimerEventsSubscription {
    timerEvents: (TimerEventsSubscription_timerEvents | null)[] | null;
}

export interface RunningTimersSubscription_runningTimers {
    __typename: "RunningTimer";
    id: number | null;
    name: string | null;
    state: TimerState | null;
    elapsedTime: number | null;
    lengths: (number | null)[] | null;
    remainingTimes: (number | null)[] | null;
    origLength: string | null;
}

export interface RunningTimersSubscription {
    runningTimers: (RunningTimersSubscription_runningTimers | null)[] | null;
}

export const runningTimersSubscription = gql`
    subscription RunningTimersSubscription {
        runningTimers {
            id
            name
            state
            elapsedTime
            lengths
            remainingTimes
            origLength
        }
    }
`;
