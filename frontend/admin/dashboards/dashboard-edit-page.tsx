import { widgetRegistry } from "@/components/widget-registry";
import { useAppSettings } from "@/settings";
import DeleteIcon from "@mui/icons-material/Delete";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import * as React from "react";
import { useParams } from "react-router-dom";
import { useBoolState } from "../../hooks";
import { IfComp } from "../../widgets";
import { PageTitle } from "../widgets";

const WidgetSettingsViewer = ({ data }: { data: string }) => {
    const [isShow, show, hide] = useBoolState();

    return (
        <>
            <Button size="small" onClick={show}>
                Show
            </Button>
            <Dialog open={isShow} onClose={hide}>
                <DialogContent>
                    <pre>{JSON.stringify(JSON.parse(data), null, 2)}</pre>
                </DialogContent>
                <DialogActions>
                    <Button onClick={hide}>Close</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export const DashboardEditPage = () => {
    const { dashboardId } = useParams<{ dashboardId: string }>();
    const { settings, removeWidget } = useAppSettings();

    const dashboardData = settings?.dashboards.filter(d => d.id === dashboardId)[0];
    const widgets = settings?.widgets.filter(w => w.dashboardId === dashboardId) ?? [];

    return (
        <Box>
            <PageTitle title={`Dashboard: ${dashboardData?.name}`} />
            <IfComp cond={!widgets.length}>
                <Typography sx={{ fontStyle: "italic" }}>No widgets</Typography>
            </IfComp>
            <IfComp cond={widgets.length}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ "& > th": { borderWidth: 2, fontSize: "1.05em", fontWeight: "bold" } }}>
                            <TableCell>Type</TableCell>
                            <TableCell>Settings</TableCell>
                            <TableCell />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {widgets.map(widget => (
                            <TableRow key={widget.id} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                                <TableCell>{widgetRegistry[widget.type].title}</TableCell>
                                <TableCell>
                                    <WidgetSettingsViewer data={widget.settings} />
                                </TableCell>
                                <TableCell>
                                    <IconButton onClick={() => removeWidget(widget.id)} size="small">
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </IfComp>
        </Box>
    );
};
