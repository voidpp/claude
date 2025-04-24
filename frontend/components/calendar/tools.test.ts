import dayjs from "dayjs";
import { generateMonthlyDayMatrix } from "./tools";

import utc from "dayjs/plugin/utc";
import weekday from "dayjs/plugin/weekday";
require("dayjs/locale/hu");

dayjs.extend(utc);
dayjs.extend(weekday);

test("generateMontlhyDayMatrix last month in the year", () => {
  expect(generateMonthlyDayMatrix(2022, 11, "hu")).toStrictEqual([
    [null, null, null, 1, 2, 3, 4],
    [5, 6, 7, 8, 9, 10, 11],
    [12, 13, 14, 15, 16, 17, 18],
    [19, 20, 21, 22, 23, 24, 25],
    [26, 27, 28, 29, 30, 31, null],
  ]);
});

test("generateMontlhyDayMatrix month started monday", () => {
  expect(generateMonthlyDayMatrix(2022, 7, "hu")).toStrictEqual([
    [1, 2, 3, 4, 5, 6, 7],
    [8, 9, 10, 11, 12, 13, 14],
    [15, 16, 17, 18, 19, 20, 21],
    [22, 23, 24, 25, 26, 27, 28],
    [29, 30, 31, null, null, null, null],
  ]);
});

test("generateMontlhyDayMatrix month started sunday", () => {
  expect(generateMonthlyDayMatrix(2023, 0, "hu")).toStrictEqual([
    [null, null, null, null, null, null, 1],
    [2, 3, 4, 5, 6, 7, 8],
    [9, 10, 11, 12, 13, 14, 15],
    [16, 17, 18, 19, 20, 21, 22],
    [23, 24, 25, 26, 27, 28, 29],
    [30, 31, null, null, null, null, null],
  ]);
});

test("generateMontlhyDayMatrix month started sunday en", () => {
  expect(generateMonthlyDayMatrix(2023, 0, "en")).toStrictEqual([
    [1, 2, 3, 4, 5, 6, 7],
    [8, 9, 10, 11, 12, 13, 14],
    [15, 16, 17, 18, 19, 20, 21],
    [22, 23, 24, 25, 26, 27, 28],
    [29, 30, 31, null, null, null, null],
  ]);
});
