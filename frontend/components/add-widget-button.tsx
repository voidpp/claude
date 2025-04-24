import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { Button, ListItemText, Menu, MenuItem } from "@mui/material";
import * as React from "react";
import { v4 as uuidv4 } from "uuid";
import { useAppConfig } from "../config";
import { useAppSettings } from "../settings";
import { widgetRegistry, WidgetType } from "./widget-registry";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

type WidgetMenuItem = {
  title: string;
} & ({ type: WidgetType } | { children: WidgetMenuItem[] });

const menu: WidgetMenuItem[] = [
  { title: "Buck", type: "buck" },
  { title: "Calendar", type: "calendar" },
  { title: "Clock", type: "clock" },
  { title: "Day counter", type: "dayCounter" },
  { title: "Gallery", type: "gallery" },
  { title: "Influx table", type: "influxTable" },
  { title: "Currencies", type: "currencies" },
  {
    title: "Weather",
    children: [
      { title: "Current", type: "currentWeather" },
      { title: "Days", type: "daysWeather" },
      { title: "Hours", type: "hoursWeather" },
    ],
  },
  { title: "Server status", type: "serverStatus" },
  { title: "Sunrise-sunset", type: "sunriseSunset" },
  { title: "Storage status", type: "storageStatus" },
  {
    title: "Home Assistant",
    children: [
      { title: "Google calendar", type: "googleCalendar" },
      { title: "Bambu Lab Print Progress", type: "hacsBambuLabPrintProgress" },
      { title: "Gauge", type: "haGauge" },
      { title: "Entity list", type: "haEntityList" },
    ],
  },
];

type MenuComponentProps = {
  onClick: (event: { currentTarget: HTMLElement }) => void;
  children: React.ReactNode;
};

const ButtonMenu = ({ children, onClick }: MenuComponentProps) => (
  <Button variant="contained" onClick={onClick}>
    {children}
    <ArrowDropDownIcon style={{ marginRight: -10 }} />
  </Button>
);

const ExpandableMenu = ({ children, onClick }: MenuComponentProps) => (
  <MenuItem onClick={onClick}>
    <ListItemText sx={{ mr: 1 }}>{children}</ListItemText>
    <NavigateNextIcon fontSize="small" />
  </MenuItem>
);

export const AddWidgetButton = () => {
  const { saveWidget } = useAppSettings();
  const { selectedDashboard } = useAppConfig();

  const addWidget = (type: WidgetType) => {
    console.log("Adding widget ROOT", type);
    saveWidget({
      dashboardId: selectedDashboard.value,
      height: widgetRegistry[type].defaultSize.h,
      id: uuidv4(),
      settings: new widgetRegistry[type].settingsType(),
      type,
      width: widgetRegistry[type].defaultSize.w,
      x: 100,
      y: 100,
    });
  };

  return (
    <WidgetMenu
      menuComponent={ButtonMenu}
      addWidget={addWidget}
      openPos="bottom"
      item={{
        title: "Widgets",
        children: menu,
      }}
    />
  );
};

type WidgetMenuProps = {
  item: WidgetMenuItem;
  addWidget: (type: WidgetType) => void;
  close?: () => void;
  parentClose?: () => void;
  menuComponent?: (props: MenuComponentProps) => JSX.Element;
  openPos?: "bottom" | "right";
};

const WidgetMenu = ({
  item,
  addWidget,
  close,
  parentClose,
  menuComponent = ExpandableMenu,
  openPos = "right",
}: WidgetMenuProps) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  if ("type" in item) {
    return (
      <MenuItem
        onClick={() => {
          addWidget(item.type);
          close?.();
          parentClose?.();
        }}
      >
        {item.title}
      </MenuItem>
    );
  }

  const MenuComponent = menuComponent;

  return (
    <>
      <MenuComponent onClick={ev => setAnchorEl(ev.currentTarget)}>{item.title}</MenuComponent>
      <Menu
        anchorOrigin={{
          vertical: openPos === "bottom" ? "bottom" : "top",
          horizontal: openPos === "bottom" ? "left" : "right",
        }}
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={() => setAnchorEl(null)}
      >
        {item.children
          .sort((a, b) => a.title.localeCompare(b.title))
          .map(childItem => (
            <WidgetMenu
              key={childItem.title}
              item={childItem}
              addWidget={addWidget}
              close={() => setAnchorEl(null)}
              parentClose={close}
              menuComponent={ExpandableMenu}
            />
          ))}
      </Menu>
    </>
  );
};
