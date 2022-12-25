import { SpecialDay, SpecialDayType } from "@/graphql-types-and-hooks";
import { Box, SxProps } from "@mui/material";
import dayjs from "dayjs";
import * as React from "react";
import { useMemo } from "react";
import { generateMonthlyDayMatrix, specialDayTypeColors } from "./tools";

export type MonthViewProps = {
    year: number;
    month: number;
    onSelectDate: (date: Date, container: HTMLDivElement) => void;
    selectedDate?: Date;
    specialDays: SpecialDay[];
    locale: string;
};

const dayContainer: SxProps = {
    textAlign: "center",
    px: 0.8,
    py: 0.5,
    borderRadius: 5,
    cursor: "pointer",
    userSelect: "none",
    "&:hover": {
        backgroundColor: "divider",
    },
};

export const MonthView = ({ year, month, onSelectDate, specialDays, locale }: MonthViewProps) => {
    const monthDays = useMemo(() => generateMonthlyDayMatrix(year, month, locale).flat(), [year, month, locale]);
    const monthLabel = useMemo(() => dayjs(new Date(year, month)).locale(locale).format("MMMM"), [month, locale]);
    const specialDates = useMemo(() => {
        return specialDays
            .filter(sd => dayjs(sd.date).month() == month && dayjs(sd.date).year() == year && sd.locale == locale)
            .reduce((curr, prev) => {
                curr[dayjs(prev.date).date()] = prev.type;
                return curr;
            }, {} as Record<string, SpecialDayType>);
    }, [specialDays, year, locale]);

    const getDayColor = (dayNumber: number) => {
        const type = specialDates[dayNumber];

        if (type) return specialDayTypeColors[type];

        const day = dayjs(new Date(year, month, dayNumber));

        if (day.day() == 6) return "green";
        if (day.day() == 0) return "red";
    };

    return (
        <Box sx={{ width: "fit-content" }}>
            <Box sx={{ textAlign: "center", textTransform: "capitalize" }}>{monthLabel}</Box>
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", width: "fit-content" }}>
                {monthDays.map((dayNumber, idx) => (
                    <Box
                        key={idx}
                        sx={{
                            ...dayContainer,
                            pointerEvents: dayNumber === null ? "none" : "unset",
                            color: getDayColor(dayNumber),
                        }}
                        onClick={ev => onSelectDate(new Date(year, month, dayNumber), ev.currentTarget)}
                    >
                        {dayNumber}
                    </Box>
                ))}
            </Box>
        </Box>
    );
};
