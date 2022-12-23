import { useAppSettings } from "@/settings";
import { IfComp, Link } from "@/widgets";
import CheckIcon from "@mui/icons-material/Check";
import { Box, Table, TableBody, TableCell, TableHead, TableRow, Tooltip } from "@mui/material";
import * as React from "react";
import { useAppConfig } from "../../config";
import { PageTitle } from "../widgets";

export const DashboardsPage = () => {
    const { settings } = useAppSettings();
    const { selectedDashboard } = useAppConfig();
    return (
        <Box>
            <PageTitle title="Dashboards" />
            <Table>
                <TableHead>
                    <TableRow sx={{ "& > th": { borderWidth: 2, fontSize: "1.05em", fontWeight: "bold" } }}>
                        <TableCell sx={{ width: 50 }} />
                        <TableCell>Name</TableCell>
                        <TableCell>Locale</TableCell>
                        <TableCell>Step size</TableCell>
                        <TableCell>Widgets</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {[...(settings?.dashboards ?? [])]
                        .sort((d1, d2) => d1.name.localeCompare(d2.name))
                        .map(dashboard => (
                            <TableRow key={dashboard.id} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                                <TableCell>
                                    <IfComp cond={selectedDashboard.value === dashboard.id}>
                                        <Tooltip title="Selected dashboard" placement="top" arrow>
                                            <CheckIcon />
                                        </Tooltip>
                                    </IfComp>
                                </TableCell>
                                <TableCell>
                                    <Link to={`/admin/dashboards/${dashboard.id}`}>{dashboard.name}</Link>
                                </TableCell>
                                <TableCell>{dashboard.locale}</TableCell>
                                <TableCell>{dashboard.stepSize}</TableCell>
                                <TableCell>
                                    {settings?.widgets.filter(w => w.dashboardId === dashboard.id).length}
                                </TableCell>
                            </TableRow>
                        ))}
                </TableBody>
            </Table>
        </Box>
    );
};
