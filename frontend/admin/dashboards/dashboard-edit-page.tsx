import { DashboardFormDialog } from "@/components/dashboard-form-dialog";
import { widgetRegistry, WidgetType } from "@/components/widget-registry";
import { useBoolState } from "@/hooks";
import { useAppSettings } from "@/settings";
import { IfComp } from "@/widgets";
import DeleteIcon from "@mui/icons-material/Delete";
import SettingsIcon from "@mui/icons-material/Settings";
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
  Tooltip,
  Typography,
} from "@mui/material";
import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useNotifications } from "../../notifications";
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
  const { settings, removeWidget, removeDashboard } = useAppSettings();
  const [isDialogOpen, openDialog, closeDialog] = useBoolState();
  const navigate = useNavigate();
  const { showNotification } = useNotifications();

  const dashboardData = settings?.dashboards.filter(d => d.id === dashboardId)[0];
  const widgets = settings?.widgets.filter(w => w.dashboardId === dashboardId) ?? [];

  return (
    <Box>
      <PageTitle title={`Dashboard: ${dashboardData?.name}`}>
        <IconButton onClick={openDialog}>
          <Tooltip title="Edit">
            <SettingsIcon />
          </Tooltip>
        </IconButton>

        <IconButton
          onClick={async () => {
            await removeDashboard(dashboardData.id);
            showNotification("Dashboard has been removed");
            navigate("/admin/dashboards");
          }}
        >
          <Tooltip title="Delete">
            <DeleteIcon />
          </Tooltip>
        </IconButton>
      </PageTitle>
      <IfComp cond={!widgets.length}>
        <Typography sx={{ fontStyle: "italic" }}>No widgets</Typography>
      </IfComp>
      <DashboardFormDialog isOpen={isDialogOpen} close={closeDialog} initialData={dashboardData} />
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
                <TableCell>
                  {widgetRegistry[widget.type as WidgetType].settingsType.name.replace(/Settings$/, "")}
                </TableCell>
                <TableCell>
                  <WidgetSettingsViewer data={widget.settings} />
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={async () => {
                      await removeWidget(widget.id);
                      showNotification("Widget has been removed");
                    }}
                    size="small"
                  >
                    <Tooltip title="Delete">
                      <DeleteIcon fontSize="small" />
                    </Tooltip>
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
