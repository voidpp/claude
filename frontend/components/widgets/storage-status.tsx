import { useInterval } from "@/hooks";
import { BaseWidgetSettings, CommonWidgetProps } from "@/types";
import { Box, SxProps } from "@mui/material";
import * as React from "react";
import { useEffect, useState } from "react";
import { RndFrame, useRnd } from "../rnd";
import { WidgetMenu } from "../widget-menu";
import { FormSelectFieldDescriptor } from "../widget-settings-dialog";

type StorageInfo = {
    device: string;
    label: string;
    mount: string;
    free: number;
    percent: number;
    total: number;
    used: number;
};

export class StorageStatusSettings extends BaseWidgetSettings {
    host: string = "";
    pollInterval: number = 600;
    title: string = "";
    sortBy: keyof StorageInfo = "device";
}

export type StorageStatusProps = CommonWidgetProps<StorageStatusSettings>;

const gigabytize = (val: number) => {
    const gb = val / 1024 / 1024 / 1024;
    return gb.toFixed(1) + " GiB";
};

const comparator = (a: any, b: any) => {
    if (a < b) return -1;
    if (b < a) return 1;
    return 0;
};

const styles = {
    body: {
        padding: "0.4em",
        "& table": {
            width: "100%",
            "& td": {
                padding: "0.15em 0.3em",
            },
        },
    },
    empty: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
    },
    title: {
        textAlign: "center",
        fontSize: "1.1em",
        padding: "0.2em",
    },
} satisfies Record<string, SxProps>;

export const StorageStatus = (props: StorageStatusProps) => {
    const { config } = props;
    const { settings } = config;
    const rndProps = useRnd(config);
    const [storageInfo, setStorageInfo] = useState<StorageInfo[]>([]);

    const fetchStorageInfo = async (host: string = null) => {
        if (host || settings.host) {
            const response = await fetch(`http://${host || settings.host}:35280/`);
            const data = await response.json();
            setStorageInfo(data.hdd);
        }
    };

    useEffect(() => {
        fetchStorageInfo();
    }, []);
    useInterval(fetchStorageInfo, settings.pollInterval * 1000);

    const onBeforeSettingsSubmit = (data: StorageStatusSettings) => fetchStorageInfo(data.host);

    const width = rndProps.size.width;

    return (
        <RndFrame rndProps={rndProps}>
            {settings.host ? (
                <Box sx={{ ...styles.body, fontSize: width * 0.05 }}>
                    {settings.title ? <Box sx={styles.title}>{settings.title}</Box> : null}
                    <table>
                        <tbody>
                            {storageInfo
                                .sort((a, b) => comparator(a[settings.sortBy], b[settings.sortBy]))
                                .map(s => (
                                    <tr key={s.mount}>
                                        <td>{s.label}</td>
                                        <td style={{ textAlign: "right" }}>{s.percent.toFixed(1)} %</td>
                                        <td style={{ textAlign: "right" }}>{gigabytize(s.free)}</td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </Box>
            ) : (
                <Box sx={{ ...styles.empty, fontSize: width * 0.07 }}>No host defined!</Box>
            )}
            <WidgetMenu
                id={config.id}
                settings={settings}
                onBeforeSubmit={onBeforeSettingsSubmit}
                defaultOpen={!settings.host}
                settingsFormFields={[
                    {
                        name: "host",
                        label: "Host",
                    },
                    {
                        name: "title",
                        label: "Title",
                    },
                    {
                        name: "pollInterval",
                        label: "Poll interval",
                    },
                    {
                        name: "sortBy",
                        label: "Sort",
                        type: "select",
                        options: [
                            { value: "device", label: "Device name" },
                            { value: "free", label: "Free bytes" },
                            { value: "label", label: "Label" },
                            { value: "mount", label: "Mount point" },
                            { value: "percent", label: "Used percent" },
                            { value: "total", label: "Total bytes" },
                            { value: "used", label: "Used bytes" },
                        ],
                    } as FormSelectFieldDescriptor,
                ]}
            />
        </RndFrame>
    );
};
