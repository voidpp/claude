import { useInterval } from "@/hooks";
import { useAppSettings } from "@/settings";
import { BaseWidgetSettings, CommonWidgetProps } from "@/types";
import { Box, SxProps, Theme, Tooltip } from "@mui/material";
import dayjs from "dayjs";
import * as React from "react";
import { useEffect, useState } from "react";
import { RndFrame, useRnd } from "../rnd";
import { WidgetMenu } from "../widget-menu";

export class DayCounterSettings extends BaseWidgetSettings {
    target: string;
    title: string = "";
}

export type DayCounterProps = CommonWidgetProps<DayCounterSettings>;

const styles = {
    container: {
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    target: {
        cursor: "pointer",
        transition: theme => theme.transitions.create("background-color"),
        px: 1,
        py: 0.3,
        borderRadius: 2,
        "&:hover": {
            backgroundColor: "rgba(255,255,255,0.1)",
        },
    },
} satisfies Record<string, SxProps<Theme>>;

const calcDayCount = (target: string) => Math.ceil(dayjs.duration(dayjs(target).diff()).asDays());

export const DayCounter = (props: DayCounterProps) => {
    const { config } = props;
    const rndProps = useRnd(config);
    const { saveWidget, getWidgetById } = useAppSettings();
    const [days, setDays] = useState(calcDayCount(config.settings.target));

    const height = rndProps.size.height;

    const resetTarget = () => {
        saveWidget({
            ...getWidgetById(config.id),
            settings: {
                ...config.settings,
                target: dayjs().format(),
            },
        });
    };

    useInterval(() => {
        setDays(calcDayCount(config.settings.target));
    }, 1000 * 60 * 60);

    useEffect(() => {
        setDays(calcDayCount(config.settings.target));
    }, [config.settings.target]);

    return (
        <RndFrame rndProps={rndProps}>
            <Box sx={styles.container}>
                <Box sx={{ fontSize: height * 0.1 }}>{config.settings.title}</Box>
                <Box sx={{ fontSize: height * 0.4 }}>{Math.abs(days)}</Box>
                <Tooltip title="Click to reset">
                    <Box sx={{ ...styles.target, fontSize: height * 0.1 }} onClick={resetTarget}>
                        {dayjs(config.settings.target).format("YYYY-MM-DD")}
                    </Box>
                </Tooltip>
            </Box>
            <WidgetMenu
                id={config.id}
                settings={config.settings}
                defaultOpen={!config.settings.target}
                settingsFormFields={[
                    {
                        name: "title",
                        label: "Title",
                    },
                    {
                        name: "target",
                        type: "date",
                        label: "Target date",
                    },
                ]}
            />
        </RndFrame>
    );
};
