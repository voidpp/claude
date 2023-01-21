import { useInterval } from "@/hooks";
import { BaseWidgetSettings, CommonWidgetProps } from "@/types";
import { Box, SxProps } from "@mui/material";
import * as React from "react";
import { useEffect, useState } from "react";
import { RndFrame, useRnd } from "../rnd";
import { WidgetMenu } from "../widget-menu";

export class InfluxTableSettings extends BaseWidgetSettings {
    title: string = "";
    url: string = "";
    query: string = "";
    columns: string = "";
    interval: number = 60;
}

type InfluxResponse = {
    error?: string;
    results?: Array<{
        statement_id: number;
        series: Array<{
            name: string;
            tags: { [s: string]: any };
            columns: Array<string>;
            values: Array<Array<any>>;
        }>;
    }>;
};

const styles = {
    body: {
        height: "100%",
        display: "flex",
        flexDirection: "column",
        "& table": {
            width: "100%",
            height: "100%",
            "& td": {
                padding: "0.1em 0.12em",
            },
            "& th:first-letter": {
                textTransform: "capitalize",
            },
        },
        padding: "0.4em",
    },
    title: {
        textAlign: "center",
        fontSize: "1.1em",
        padding: "0.1em",
    },
    noConfig: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
    },
} satisfies Record<string, SxProps>;

export const InfluxTable = ({ config }: CommonWidgetProps<InfluxTableSettings>) => {
    const [data, setData] = useState([]);
    const rndProps = useRnd(config, 10);

    const fetchData = async (settings: InfluxTableSettings = config.settings) => {
        if (!settings.url) return;

        const response = await fetch(settings.url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Accept: "application/json",
            },
            body: `q=${encodeURIComponent(settings.query)}`,
        });
        const data: InfluxResponse = await response.json();

        if (data.error) {
            console.error(data.error);
            return;
        }

        let res = [];
        for (let rowData of data.results[0].series) {
            let row = { ...rowData.tags };
            rowData.columns.map((c, idx) => {
                row[c] = rowData.values[0][idx];
            });
            res.push(row);
        }
        setData(res);
    };

    useInterval(fetchData, config.settings.interval * 1000);

    useEffect(() => {
        fetchData();
    }, []);

    const cols = () => {
        return config.settings.columns.split(",").map(s => s.trim());
    };

    const renderCell = (col: string, val: any) => {
        const isNum = !isNaN(val);
        return (
            <td style={{ textAlign: isNum ? "right" : "left" }} key={col}>
                {isNum ? val.toFixed(1) : val}
            </td>
        );
    };

    const renderRow = (row: any, idx: number) => <tr key={idx}>{cols().map(c => renderCell(c, row[c]))}</tr>;

    return (
        <RndFrame rndProps={rndProps}>
            <Box sx={{ ...styles.body, fontSize: (rndProps.size.width as number) * 0.06 }}>
                {config.settings.title ? <Box sx={styles.title}>{config.settings.title}</Box> : null}
                {config.settings.url ? null : <Box sx={styles.noConfig}>No config.</Box>}
                <div style={{ flexGrow: 1 }}>
                    <table>
                        <thead>
                            <tr>
                                {cols().map(c => (
                                    <th key={c}>{c}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>{data.map(renderRow)}</tbody>
                    </table>
                </div>
            </Box>
            <WidgetMenu
                id={config.id}
                settings={config.settings}
                onBeforeSubmit={fetchData}
                settingsFormFields={[
                    { name: "title", label: "Title" },
                    { name: "url", label: "URL" },
                    { name: "query", label: "Query" },
                    { name: "columns", label: "Columns" },
                    { name: "interval", label: "Interval" },
                ]}
            />
        </RndFrame>
    );
};
