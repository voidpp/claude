import { countries } from "@/countries";
import { ServerStatusQueryResult, useServerStatusQuery } from "@/graphql-types-and-hooks";
import { BaseWidgetSettings, CommonWidgetProps } from "@/types";
import { FlagIcon, IfComp } from "@/widgets";
import { Box, SxProps } from "@mui/material";
import * as React from "react";
import { RndFrame, useRnd } from "../rnd";
import { WidgetMenu } from "../widget-menu";
import {
    FormCheckboxListFieldDescriptor,
    FormListFieldDescriptor,
    FormNumberFieldDescriptor,
    FormSelectFieldDescriptor,
} from "../widget-settings-dialog";

import { entries } from "@/tools";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import HelpIcon from "@mui/icons-material/Help";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";

export type Column = "name" | "ping" | "load" | "memory" | "uptime";

type ServerStatusProps = CommonWidgetProps<ServerStatusSettings>;

const colRatioRef: { [key in Column]: (props: ServerStatusProps) => number } = {
    name: p => 0.85 - (Math.max(...Object.values(p.config.settings.servers).map(s => s.name.length)) - 7) / 70,
    ping: p => 0.95,
    load: p => 0.75,
    memory: p => 0.95,
    uptime: p => 0.9,
};

const getBodyStyle = (props: ServerStatusProps): SxProps => ({
    fontSize: () => {
        let baseSize = props.config.width * 0.062;
        for (let [col, enabled] of entries(props.config.settings.columns)) {
            if (enabled) baseSize *= colRatioRef[col](props);
        }

        return baseSize > 100 ? 16 : baseSize < 5 ? 10 : baseSize;
    },
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

const Status = ({ ip, data }: { ip: string; data: ServerStatusQueryResult["data"]["serverStatus"] }) => {
    let Icon = HelpIcon;
    let color = "unset";

    if (data) {
        if (data.ping == null) {
            Icon = RemoveCircleIcon;
            color = "#d40303";
        } else {
            Icon = data.status.load ? CheckCircleIcon : ErrorIcon;
            color = data.status.load ? "#37a702" : "#d46703";
        }
    }

    return <Icon sx={{ color }} fontSize="small" />;
};

const loadColStyle: React.CSSProperties = {
    textAlign: "right",
};

const StatusRow = ({ config, settings }: { config: ServerConfig; settings: ServerStatusSettings }) => {
    const { data } = useServerStatusQuery({
        variables: { ip: config.ip, statusServerPort: config.systemStatusServerPort },
    });

    const info = data?.serverStatus;

    const baseCols = (
        <IfComp cond={settings.columns.name}>
            <td>
                <Status ip={config.ip} data={info} />
            </td>
            <td>{config.name}</td>
            <td style={{ maxWidth: 30 }}>
                <FlagIcon name={config.location} />
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
        <tr key={config.name}>
            {baseCols}
            <IfComp cond={settings.columns.ping}>
                <td style={{ textAlign: "right" }}>{info.ping != null ? `${info.ping} ms` : null}</td>
            </IfComp>
            <IfComp cond={settings.columns.load}>
                <td style={loadColStyle}>{info.status.load ? info.status.load[0].toFixed(2) : null}</td>
                <td style={loadColStyle}>{info.status.load ? info.status.load[1].toFixed(2) : null}</td>
                <td style={loadColStyle}>{info.status.load ? info.status.load[2].toFixed(2) : null}</td>
            </IfComp>
            <IfComp cond={settings.columns.memory}>
                <td style={{ textAlign: "right" }}>
                    {info.status.memory ? `${info.status.memory.percent.toFixed(1)}%` : null}
                </td>
            </IfComp>
            <IfComp cond={settings.columns.uptime}>
                <td>{info.status.uptime}</td>
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
            <Box sx={getBodyStyle(props)}>
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
                                <StatusRow config={server} settings={settings} />
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
