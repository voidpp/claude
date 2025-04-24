import { createContextProviderComponent } from "@/widgets";
import { Alert, AlertProps, Slide, SlideProps, Snackbar } from "@mui/material";
import * as React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { useBoolState } from "./hooks";

type NotificationData = {
  severity: AlertProps["severity"];
  message: string;
};

const useNotificationsHandler = () => {
  const [notification, setNotification] = useState<NotificationData>();

  const showNotification = (message: string, severity: AlertProps["severity"] = "success") => {
    setNotification({ message, severity });
  };

  return {
    showNotification,
    notification,
  };
};

const NotificationContext = createContext(undefined);

export const useNotifications = () => useContext<ReturnType<typeof useNotificationsHandler>>(NotificationContext);

export const NotificationContextProvider = createContextProviderComponent(NotificationContext, useNotificationsHandler);

function TransitionDown(props: Omit<SlideProps, "direction">) {
  return <Slide {...props} direction="down" />;
}

export const Notification = () => {
  const { notification } = useNotifications();
  const [isShow, show, hide] = useBoolState(false);

  useEffect(() => {
    if (notification) show();
  }, [notification]);

  return (
    <Snackbar
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      open={isShow}
      onClose={hide}
      TransitionComponent={TransitionDown}
    >
      <Alert severity={notification?.severity} sx={{ width: "100%" }} onClose={hide} variant="filled">
        {notification?.message}
      </Alert>
    </Snackbar>
  );
};
