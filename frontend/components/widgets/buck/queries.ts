import { gql } from "@apollo/client";

export enum TimerEventType {
    ALARM = "ALARM",
    CLEAR_ALARM = "CLEAR_ALARM",
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

export enum TimerOperation {
    PAUSE = "PAUSE",
    STOP = "STOP",
    UNPAUSE = "UNPAUSE",
    CLEAR_ALARM = "CLEAR_ALARM",
}

export interface TimerOperationMutation_operateTimer_errors {
    __typename: "Error";
    type: string | null;
}

export interface TimerOperationMutation_operateTimer {
    __typename: "ValidationResult";
    errors: (TimerOperationMutation_operateTimer_errors | null)[] | null;
}

export interface TimerOperationMutation {
    operateTimer: TimerOperationMutation_operateTimer | null;
}

export interface TimerOperationMutationVariables {
    id: number;
    operation: TimerOperation;
}

export const timerOperationMutation = gql`
    mutation TimerOperationMutation($id: Int!, $operation: TimerOperation!) {
        operateTimer(id: $id, operation: $operation) {
            errors {
                type
            }
        }
    }
`;
