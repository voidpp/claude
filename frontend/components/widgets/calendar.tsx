import { useCurrentDashboard, useDayColorGetter, useInterval } from "@/hooks";
import { BaseWidgetSettings, CommonWidgetProps } from "@/types";
import { Box, SxProps } from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import * as React from "react";
import { useEffect, useState } from "react";
import { RndFrame, RndProps, useRnd } from "../rnd";
import { WidgetMenu } from "../widget-menu";
import { FormSelectFieldDescriptor } from "../widget-settings-dialog";

export class CalendarSettings extends BaseWidgetSettings {
    months: "fixed" | "rolling" = "fixed";
}

function roundTo(val: number, to: number): number {
    return Math.round(val / to) * to;
}

const bodyPadding = 5;

const styles = {
    body: {
        padding: `${bodyPadding}px`,
        display: "flex",
        flexDirection: "column",
        height: "100%",
    },
    currentDateRow: {
        textAlign: "center",
        paddingBottom: "0.5em",
        "&::first-letter": {
            textTransform: "uppercase",
        },
    },
    weekRow: {
        display: "grid",
        gridTemplateColumns: "repeat(7, 1fr)",
        justifyItems: "center",
        paddingBottom: "0.5em",
    },
    daysGridContainer: {
        overflow: "hidden",
        flexGrow: 1,
        position: "relative",
    },
    daysGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(7, 1fr)",
        justifyItems: "stretch",
        alignItems: "stretch",
        position: "relative",
    },
    dayCell: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    notCurrentMonthDay: {
        opacity: 0.3,
    },
    todayCell: {
        borderRadius: "50%",
        border: "3px solid #eee",
    },
} satisfies Record<string, SxProps>;

export type CalendarProps = CommonWidgetProps<CalendarSettings>;

const gridAutoRows = ({ config }: CalendarProps, width: number) => {
    return config.settings.months == "rolling" ? `${(width - 2 * bodyPadding) / 7}px` : "";
};

const today = () => dayjs(new Date().getTime()).startOf("day").format("YYYYMMDD");

const calcDayPadding = ({ width, height }: RndProps["size"]) => {
    return roundTo((height - width) / (width * 0.03), 7);
};

export const Calendar = (props: CalendarProps) => {
    const { config } = props;
    const rndProps = useRnd(config);
    const daysGridContainerElement = React.useRef<HTMLElement>();
    const currentDashboard = useCurrentDashboard();
    const [currentDate, setCurrentDate] = useState(() => today());
    const getDayColor = useDayColorGetter(currentDashboard.locale);

    useInterval(() => {
        const newVal = today();
        if (currentDate != newVal) setCurrentDate(newVal);
    }, 1000);

    useEffect(() => {
        if (!daysGridContainerElement.current) return;
        let daysGrid = daysGridContainerElement.current.childNodes[0] as HTMLElement;
        daysGrid.style.top =
            config.settings.months == "fixed"
                ? "0px"
                : `${(daysGridContainerElement.current.offsetHeight - daysGrid.scrollHeight) / 2}px`;
    });

    const currentMomentDate = dayjs(currentDate).locale(currentDashboard.locale);

    const dayPadding = config.settings.months == "rolling" ? calcDayPadding(rndProps.size) : 0;

    const firstDayOfWeekForMonth = parseInt(currentMomentDate.startOf("month").format("d"));

    let cyc = currentMomentDate.startOf("month").subtract(firstDayOfWeekForMonth - 1 + dayPadding, "d");

    let days: Dayjs[] = [];

    let end = currentMomentDate.add(2, "month").startOf("month").subtract(1, "d");
    end.add(7 - end.weekday() + dayPadding, "d");

    while (1) {
        days.push(cyc.clone());
        cyc = cyc.add(1, "d");

        if (cyc.isAfter(end)) break;
    }

    const currentMonth = currentMomentDate.format("M");

    return (
        <RndFrame rndProps={rndProps}>
            <Box sx={{ ...styles.body, fontSize: rndProps.size.width * 0.06 }}>
                <Box sx={styles.currentDateRow}>{currentMomentDate.format("MMMM")}</Box>
                <Box sx={styles.weekRow}>
                    {currentMomentDate
                        .localeData()
                        .weekdaysShort()
                        .map((name, idx) => (
                            <div key={idx}>{name}</div>
                        ))}
                </Box>
                <Box sx={styles.daysGridContainer} ref={daysGridContainerElement}>
                    <Box
                        sx={{
                            ...styles.daysGrid,
                            gridAutoRows: gridAutoRows(props, rndProps.size.width),
                            height: config.settings.months == "fixed" ? "100%" : "auto",
                        }}
                    >
                        {days.map((day: Dayjs) => {
                            const month = day.format("M");
                            const dayNumber = day.format("D");
                            return (
                                <Box
                                    sx={{
                                        ...styles.dayCell,
                                        fontSize: rndProps.size.width * 0.06,
                                        opacity: currentMonth == month ? 1 : 0.3,
                                        ...(day.isSame(today()) ? styles.todayCell : {}),
                                        color: getDayColor(day),
                                    }}
                                    key={`${month}.${dayNumber}`}
                                >
                                    {dayNumber}
                                </Box>
                            );
                        })}
                    </Box>
                </Box>
            </Box>
            <WidgetMenu
                id={config.id}
                settings={config.settings}
                settingsFormFields={[
                    {
                        name: "months",
                        label: "Months",
                        type: "select",
                        options: [
                            { value: "fixed", label: "Fixed" },
                            { value: "rolling", label: "Rolling" },
                        ],
                    } as FormSelectFieldDescriptor,
                ]}
            />
        </RndFrame>
    );
};
