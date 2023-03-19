import { useCurrentDashboard, useInterval } from "@/hooks";
import { BaseWidgetSettings, CommonWidgetProps } from "@/types";
import { Box, SxProps, Theme } from "@mui/material";
import dayjs from "dayjs";
import * as React from "react";
import { useState } from "react";
import { RndFrame, useRnd } from "../rnd";
import { WidgetMenu } from "../widget-menu";

export class ClockSettings extends BaseWidgetSettings {
    showDate: boolean = true;
    timeFormat: string = "HH:mm";
    dateFormat: string = "YYYY. MMMM D. dddd";
}

const isRapberry = window.navigator.userAgent.search("Raspbian") !== -1;

export type ClockProps = CommonWidgetProps<ClockSettings>;

const bodyStyle: SxProps = {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    overflow: "hidden",
};

const getDateStyle = (height: number): SxProps => ({
    textAlign: "center",
    lineHeight: "95%",
    fontWeight: "bold",
    fontSize: height * 0.17,
});

const getTimeString = (timeFormat: string) => dayjs().format(timeFormat);

const DateDisplay = ({ height, format }: { height: number; format: string }) => {
    const { locale } = useCurrentDashboard();
    return <Box sx={getDateStyle(height)}>{dayjs().locale(locale).format(format)}</Box>;
};

export const Clock = (props: ClockProps) => {
    const { config } = props;
    const [time, setTime] = useState(getTimeString(config.settings.timeFormat));
    const rndProps = useRnd(config);

    useInterval(() => {
        setTime(getTimeString(config.settings.timeFormat));
    }, 1000);

    const height = rndProps.size.height;

    const clockStyle: SxProps<Theme> = {
        textAlign: "center",
        lineHeight: "90%",
        fontFamily: "Digital7",
        marginTop: 0,
        fontSize: height * 0.8,
    };

    if (isRapberry) Object.assign(clockStyle, { lineHeight: 1.2, marginTop: `${height * -0.24}px` } as SxProps<Theme>);

    return (
        <RndFrame rndProps={rndProps}>
            <Box sx={bodyStyle}>
                <Box sx={clockStyle}>{time}</Box>
                {props.config.settings.showDate && <DateDisplay height={height} format={config.settings.dateFormat} />}
            </Box>
            <WidgetMenu
                id={config.id}
                settings={config.settings}
                settingsFormFields={[
                    {
                        name: "timeFormat",
                        label: "Time format",
                    },
                    {
                        name: "dateFormat",
                        label: "Date format",
                    },
                    {
                        name: "showDate",
                        label: "Show date",
                    },
                ]}
            />
        </RndFrame>
    );
};
