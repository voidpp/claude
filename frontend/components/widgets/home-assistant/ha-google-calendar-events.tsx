import { BaseWidgetSettings, CommonWidgetProps } from "@/types";
import { Box, Typography } from "@mui/material";
import * as React from "react";
import { RndFrame, useRnd } from "../../rnd";
import { WidgetMenu } from "../../widget-menu";
import { FormNumberFieldDescriptor, FormSelectFieldDescriptor } from "../../widget-settings/types";
import { useGoogleCalendarList } from "@/home-assistant/use-google-calendar-list";
import { CalendarEventProps, useGoogleCalendarEventList } from "@/home-assistant/use-google-calendar-event-list";
import dayjs, { Dayjs } from "dayjs";
import { useCurrentDashboard, useInterval } from "@/hooks";
import { red, blue, green, teal, lime, yellow, orange, brown } from "@mui/material/colors";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocationOnIcon from "@mui/icons-material/LocationOn";

export class GoogleCalendarEventsSettings extends BaseWidgetSettings {
  calendarIdList: string[] = [];
  daysToShow: number = 14;
}

export type GoogleCalendarEventsProps = CommonWidgetProps<GoogleCalendarEventsSettings>;

const useToday = () => {
  const [today, setToday] = React.useState(dayjs().startOf("day"));

  useInterval(() => {
    const now = dayjs().startOf("day");
    if (today.format("YYYY-MM-DDTHH:mm:ssZ") !== now.format("YYYY-MM-DDTHH:mm:ssZ")) setToday(now);
  }, 1000 * 60);

  return today;
};

const calendarColors = [green[500], blue[500], yellow[500], orange[500], teal[500], red[500], brown[500], lime[500]];

const useEventColor = (calendarId: string) => {
  return React.useMemo(() => {
    const data: Record<string, number> = JSON.parse(window.localStorage.getItem("calendarColors") ?? "{}");
    const storedColorIndex = data[calendarId];

    if (storedColorIndex !== undefined) {
      return calendarColors[storedColorIndex];
    } else {
      const usedColors = new Set(Object.values(data));
      const colorIndex = calendarColors.findIndex((_, index) => !usedColors.has(index));

      if (colorIndex !== -1) {
        data[calendarId] = colorIndex;
        window.localStorage.setItem("calendarColors", JSON.stringify(data));
        return calendarColors[colorIndex];
      }
    }

    return calendarColors[0];
  }, [calendarId]);
};

const CalendarEventSummary = ({ event, calendarId }: { event: CalendarEventProps; calendarId: string }) => {
  const isFullDayEvent = event.start.dateTime === undefined;
  const color = useEventColor(calendarId);

  return (
    <Box
      sx={{
        borderLeft: `2px solid ${color}`,
        pl: 2,
        height: "100%",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Box>{event.summary}</Box>
        {!isFullDayEvent && (
          <Box sx={{ display: "flex", gap: 0.5, color: "text.secondary" }}>
            <AccessTimeIcon sx={{ fontSize: 14, mt: 0.25 }} />
            <Typography variant="caption">
              {dayjs(event.start.dateTime).format("H:mm")} - {dayjs(event.end.dateTime).format("H:mm")}
            </Typography>
          </Box>
        )}
        {event.location && (
          <Box sx={{ display: "flex", gap: 0.5, color: "text.secondary" }}>
            <LocationOnIcon sx={{ fontSize: 14, mt: 0.25 }} />
            <Typography variant="caption" sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {event.location}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

const CalendarEventsRow = ({
  events,
  day,
}: {
  events: { event: CalendarEventProps; calendarId: string }[];
  day: Dayjs;
}) => {
  const { locale } = useCurrentDashboard();
  const rowDay = day.locale(locale);

  return (
    <Box sx={{ display: "flex", alignItems: "stretch", gap: 1 }}>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", width: 40, minWidth: 40 }}>
        <Typography variant="body2">{rowDay.format("ddd")}</Typography>
        <Typography variant="h5" sx={{ my: -0.5 }}>
          {rowDay.format("D")}
        </Typography>
        <Typography variant="body2" sx={{ textTransform: "uppercase", fontSize: 12 }}>
          {rowDay.format("MMM")}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "stretch", my: 0.5, overflow: "hidden" }}>
        {events.map(event => (
          <CalendarEventSummary {...event} key={event.event.uid} />
        ))}
      </Box>
    </Box>
  );
};

export const HAGoogleCalendarEvents = (props: GoogleCalendarEventsProps) => {
  const { config } = props;
  const rndProps = useRnd(config);
  const { data: calendarList } = useGoogleCalendarList();
  const today = useToday();
  const { data: events } = useGoogleCalendarEventList(
    config.settings.calendarIdList,
    today,
    today.add(config.settings.daysToShow, "day")
  );

  return (
    <RndFrame rndProps={rndProps}>
      <Box>
        {config.settings.calendarIdList.length == 0 ? (
          <Box sx={{ textAlign: "center", fontSize: 20, color: "text.secondary", mt: 3 }}>No calendars selected</Box>
        ) : (
          <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 0.5 }}>
            {events?.map(({ dayEvents, day }) => (
              <CalendarEventsRow events={dayEvents} key={day.unix()} day={day} />
            ))}
          </Box>
        )}
      </Box>
      <WidgetMenu
        id={config.id}
        settings={config.settings}
        defaultOpen={config.settings.calendarIdList?.length === 0}
        settingsFormFields={[
          {
            name: "calendarIdList",
            label: "Calendars",
            required: true,
            type: "select",
            multiple: true,
            options:
              calendarList?.map(calendar => ({
                value: calendar.entity_id,
                label: calendar.name,
              })) ?? [],
          } as FormSelectFieldDescriptor,
          {
            name: "daysToShow",
            label: "Days",
            default: 14,
            min: 1,
            max: 365,
          } as FormNumberFieldDescriptor,
        ]}
      />
    </RndFrame>
  );
};
