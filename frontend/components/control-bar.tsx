import MenuIcon from "@mui/icons-material/Menu";
import ReplayCircleFilledIcon from "@mui/icons-material/ReplayCircleFilled";
import SettingsIcon from "@mui/icons-material/Settings";
import { Box, Button, Divider, Drawer, IconButton, Typography } from "@mui/material";
import * as React from "react";
import { mainSubscriptionClient } from "../client";
import { useAppConfig } from "../config";
import { useBoolState, useCurrentDashboard } from "../hooks";
import { copyObject } from "../tools";
import { Link } from "../widgets";
import { AddWidgetButton } from "./add-widget-button";
import { ConnectionIndicator } from "./connection-indicator";
import { DashbardButton } from "./dashboard-button";
import { DashboardFormDialog } from "./dashboard-form-dialog";
import { useVersionQuery } from "@/graphql-types-and-hooks";

const CurrentDashboardItem = () => {
  const { selectedDashboard } = useAppConfig();
  const [isDialogOpen, openDialog, closeDialog] = useBoolState();

  const currentDashboard = useCurrentDashboard();

  if (!selectedDashboard.value) return <Typography sx={{ fontStyle: "italic" }}>No dashboard selected</Typography>;

  if (!currentDashboard) return <span />;

  return (
    <Box style={{ display: "flex", alignItems: "center", marginTop: -10, marginBottom: -10 }}>
      <Typography>{currentDashboard.name}</Typography>
      <IconButton sx={{ margin: 1 }} onClick={openDialog}>
        <SettingsIcon />
      </IconButton>
      <DashboardFormDialog
        isOpen={isDialogOpen}
        close={closeDialog}
        initialData={copyObject(currentDashboard, ["__typename"])}
      />
      <AddWidgetButton />
    </Box>
  );
};

const BarDivider = () => <Divider orientation="vertical" flexItem sx={{ marginLeft: 2, marginRight: 2 }} />;

export const ControlBar = () => {
  const [isOpen, _, close, toggle] = useBoolState();
  const { data } = useVersionQuery();

  return (
    <>
      <Box sx={{ position: "absolute", zIndex: theme => theme.zIndex.drawer + 1 }}>
        <IconButton sx={{ margin: 1 }} onClick={toggle}>
          <MenuIcon />
        </IconButton>
      </Box>
      <Drawer anchor="top" open={isOpen} onClose={close}>
        <Box style={{ display: "flex", alignItems: "center", padding: 10, marginLeft: 45 }}>
          <span style={{ paddingRight: 10 }}>Zsomapell Klod!</span>
          <DashbardButton />
          <BarDivider />
          <CurrentDashboardItem />
          <BarDivider />
          <Button onClick={() => window.location.reload()}>
            <ReplayCircleFilledIcon sx={{ mr: 1 }} />
            reload
          </Button>
          <BarDivider />
          <ConnectionIndicator client={mainSubscriptionClient} />
          <BarDivider />v{data?.version}
          <Box sx={{ flex: 1, textAlign: "right" }}>
            <Link to="/admin">Admin</Link>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};
