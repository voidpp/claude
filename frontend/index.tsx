import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import weekday from "dayjs/plugin/weekday";
import * as React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./components/app";
require("dayjs/locale/hu");

dayjs.extend(utc);
dayjs.extend(weekday);

const root = createRoot(document.getElementById("body"));
root.render(<App />);
