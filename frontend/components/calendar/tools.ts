import dayjs from "dayjs";
import { SpecialDayType } from "../../graphql-types-and-hooks";

export function generateMonthlyDayMatrix(year: number, month: number, locale = "en"): number[][] {
    const result: number[][] = [];

    const firstDayOfMonth = new Date(year, month, 1);

    let currentDay = dayjs(firstDayOfMonth)
        .locale(locale)
        .subtract(dayjs(firstDayOfMonth).locale(locale).weekday(), "days");

    while (true) {
        const row: number[] = [];
        for (let day = 1; day <= 7; day++) {
            row.push(currentDay.month() == month ? currentDay.date() : null);
            currentDay = currentDay.add(1, "days");
        }
        result.push(row);
        if (currentDay.month() > month || currentDay.year() > year) break;
    }

    return result;
}

export const specialDayTypeColors: Record<SpecialDayType, string> = {
    [SpecialDayType.NonWorkingDay]: "red",
    [SpecialDayType.RelocatedRestDay]: "green",
    [SpecialDayType.RelocatedWorkingDay]: "white",
};
