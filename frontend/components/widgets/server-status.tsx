import { countries } from "@/countries";
import { ServerStatusQueryResult, useServerStatusQuery } from "@/graphql-types-and-hooks";
import { BaseWidgetSettings, CommonWidgetProps } from "@/types";
import { FlagIcon, IfComp } from "@/widgets";
import { Box, SxProps } from "@mui/material";
import * as React from "react";
import { RndFrame, RndProps, useRnd } from "../rnd";
import { WidgetMenu } from "../widget-menu";
import {
    FormCheckboxListFieldDescriptor,
    FormListFieldDescriptor,
    FormNumberFieldDescriptor,
    FormSelectFieldDescriptor,
} from "../widget-settings-dialog";

import { useCurrentDashboard } from "@/hooks";
import { entries } from "@/tools";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import HelpIcon from "@mui/icons-material/Help";
import dayjs from "dayjs";

export type Column = "name" | "ping" | "load" | "memory" | "uptime";

type ServerStatusProps = CommonWidgetProps<ServerStatusSettings>;

const colRatioRef: { [key in Column]: (settings: ServerStatusSettings) => number } = {
    name: settings => 0.85 - (Math.max(...Object.values(settings.servers).map(s => s.name.length)) - 7) / 70,
    ping: settings => 0.95,
    load: settings => 0.75,
    memory: settings => 0.95,
    uptime: settings => 0.9,
};

const calcFontSize = (settings: ServerStatusSettings, width: number) => {
    let baseSize = width * 0.062;
    for (let [col, enabled] of entries(settings.columns)) {
        if (enabled) baseSize *= colRatioRef[col](settings);
    }

    return baseSize > 100 ? 16 : baseSize < 5 ? 10 : baseSize;
};

const getBodyStyle = (settings: ServerStatusSettings, width: number): SxProps => ({
    fontSize: () => calcFontSize(settings, width),
    padding: "0.5em",
    "& table": {
        borderSpacing: 0,
        width: "100%",
        "& td, & th": {
            padding: "0.2em 0.4em",
        },
        "& tr": {
            transition: "opacity 1s",
        },
        "& th": {
            borderBottom: "1px solid rgba(255,255,255,0.5)",
        },
    },
});

export type ServerConfig = {
    id: string;
    ip: string;
    name: string;
    location: string;
    systemStatusServerPort?: number;
    rank: number;
};

type ServerConfigMap = { [s: string]: ServerConfig };

export class ServerStatusSettings extends BaseWidgetSettings {
    servers: ServerConfigMap = {};
    columns: { [key in Column]: boolean } = { load: true, memory: true, name: true, ping: true, uptime: true };
    pollInterval: number = 60;
}

const StatusIcon = ({ data }: { data: ServerStatusQueryResult["data"]["serverStatus"] }) => {
    let Icon = HelpIcon;
    let color = "unset";

    if (data) {
        if (data.ping == null) {
            Icon = CancelIcon;
            color = "#d40303";
        } else {
            Icon = data.status?.load ? CheckCircleIcon : ErrorIcon;
            color = data.status?.load ? "#37a702" : "#d46703";
        }
    }

    return <Icon sx={{ color, marginBottom: "-3px" }} fontSize="inherit" />;
};

const loadColStyle: React.CSSProperties = {
    textAlign: "right",
};

const StatusRow = ({
    config,
    settings,
    widgetSize,
}: {
    config: ServerConfig;
    settings: ServerStatusSettings;
    widgetSize: RndProps["size"];
}) => {
    const { data } = useServerStatusQuery({
        variables: { ip: config.ip, statusServerPort: config.systemStatusServerPort },
    });
    const { locale } = useCurrentDashboard();

    const info = data?.serverStatus;
    const flagSize = calcFontSize(settings, widgetSize.width);

    const baseCols = (
        <IfComp cond={settings.columns.name}>
            <td>
                <StatusIcon data={info} />
            </td>
            <td>{config.name}</td>
            <td style={{ maxWidth: flagSize * 1.5 }}>
                <FlagIcon name={config.location} size={flagSize} />
            </td>
        </IfComp>
    );

    if (!info)
        return (
            <tr style={{ opacity: 0.3 }} key={config.name}>
                {baseCols}
            </tr>
        );

    return (
        <tr>
            {baseCols}
            <IfComp cond={settings.columns.ping}>
                <td style={{ textAlign: "right" }}>{info.ping != null ? `${info.ping} ms` : null}</td>
            </IfComp>
            <IfComp cond={settings.columns.load}>
                <td style={loadColStyle}>{info.status ? info.status.load[0].toFixed(2) : null}</td>
                <td style={loadColStyle}>{info.status ? info.status.load[1].toFixed(2) : null}</td>
                <td style={loadColStyle}>{info.status ? info.status.load[2].toFixed(2) : null}</td>
            </IfComp>
            <IfComp cond={settings.columns.memory}>
                <td style={{ textAlign: "right" }}>
                    {info.status ? `${info.status.memory.percent.toFixed(1)}%` : null}
                </td>
            </IfComp>
            <IfComp cond={settings.columns.uptime}>
                <td>
                    {info.status?.uptime
                        ? dayjs
                              .duration(info.status?.uptime * 1000)
                              .locale(locale)
                              .humanize()
                        : ""}
                </td>
            </IfComp>
        </tr>
    );
};

export const ServerStatus = (props: ServerStatusProps) => {
    const { config } = props;
    const { settings } = config;
    const rndProps = useRnd(config);

    const onBeforeSettingsSubmit = (data: ServerStatusSettings) => {};

    return (
        <RndFrame rndProps={rndProps}>
            <Box sx={getBodyStyle(settings, rndProps.size.width)}>
                <table>
                    <thead>
                        <tr>
                            <IfComp cond={settings.columns.name}>
                                <th colSpan={3}>Name</th>
                            </IfComp>
                            <IfComp cond={settings.columns.ping}>
                                <th>Ping</th>
                            </IfComp>
                            <IfComp cond={settings.columns.load}>
                                <th colSpan={3}>Load</th>
                            </IfComp>
                            <IfComp cond={settings.columns.memory}>
                                <th>Mem</th>
                            </IfComp>
                            <IfComp cond={settings.columns.uptime}>
                                <th>Uptime</th>
                            </IfComp>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.values(settings.servers)
                            .sort((s1, s2) => s1.rank - s2.rank)
                            .map(server => (
                                <StatusRow
                                    config={server}
                                    settings={settings}
                                    key={server.name}
                                    widgetSize={rndProps.size}
                                />
                            ))}
                    </tbody>
                </table>
            </Box>
            <WidgetMenu
                id={config.id}
                onBeforeSubmit={onBeforeSettingsSubmit}
                settings={config.settings}
                defaultOpen={!Object.values(config.settings.servers).length}
                dialogMaxWidth="md"
                settingsFormFields={[
                    {
                        name: "pollInterval",
                        label: "Polling interval",
                        min: 0,
                        max: 65565,
                    } as FormNumberFieldDescriptor,
                    {
                        type: "list",
                        label: "Servers",
                        name: "servers",
                        fields: [
                            {
                                name: "name",
                                label: "Name",
                                default: "",
                                small: true,
                            },
                            {
                                name: "ip",
                                label: "IP",
                                default: "",
                                small: true,
                            },
                            {
                                name: "location",
                                label: "Location",
                                default: "hu",
                                type: "select",
                                small: true,
                                options: Object.keys(countries).map(code => ({ value: code, label: countries[code] })),
                            } as FormSelectFieldDescriptor,
                            {
                                name: "systemStatusServerPort",
                                label: "Status port",
                                small: true,
                                default: 35280,
                            },
                        ],
                    } as FormListFieldDescriptor,
                    {
                        type: "checkboxList",
                        name: "columns",
                        label: "Columns",
                        options: [
                            { value: "name", label: "Name" },
                            { value: "ping", label: "Ping" },
                            { value: "load", label: "Load" },
                            { value: "memory", label: "Memory" },
                            { value: "uptime", label: "Uptime" },
                        ],
                    } as FormCheckboxListFieldDescriptor,
                ]}
            />
        </RndFrame>
    );
};
