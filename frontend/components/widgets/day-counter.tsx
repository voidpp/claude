import { useAppSettings } from "@/settings";
import { BaseWidgetSettings, CommonWidgetProps } from "@/types";
import { Box, SxProps, Theme, Tooltip } from "@mui/material";
import dayjs from "dayjs";
import * as React from "react";
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

export const DayCounter = (props: DayCounterProps) => {
    const { config } = props;
    const rndProps = useRnd(config);
    const { saveWidget, getWidgetById } = useAppSettings();

    const days = Math.ceil(dayjs.duration(dayjs(config.settings.target).diff()).asDays());

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
