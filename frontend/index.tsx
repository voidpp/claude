import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import localeData from "dayjs/plugin/localeData";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import weekday from "dayjs/plugin/weekday";
import * as React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./components/app";
import "dayjs/locale/hu";

dayjs.extend(localeData);
dayjs.extend(utc);
dayjs.extend(weekday);
dayjs.extend(duration);
dayjs.extend(relativeTime);

const root = createRoot(document.getElementById("body"));
root.render(<App />);
