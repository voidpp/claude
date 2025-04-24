import { useQuery } from "@tanstack/react-query";
import { useHomeAssistantServer } from "./client";
import dayjs, { Dayjs } from "dayjs";
import { HomeAssistantKeys } from "./keys";

type DateInput = { date?: string; dateTime?: string };

export type CalendarEventProps = {
  start: DateInput;
  end: DateInput;
  summary: string;
  location?: string;
  description?: string;
  uid?: string;
  recurrence_id?: string;
  rrule?: string;
};

export const useGoogleCalendarEventList = (entityIdList: string[], start: Dayjs, end: Dayjs) => {
  const { fetch, enabled } = useHomeAssistantServer();
  return useQuery({
    queryKey: HomeAssistantKeys.googleCalendarEventList(
      entityIdList,
      start.format("YYYY-MM-DD"),
      end.format("YYYY-MM-DD")
    ),
    enabled: enabled && entityIdList.length > 0,
    queryFn: async () => {
      const promises = entityIdList.map(async entityId => {
        const events = await fetch<CalendarEventProps[]>({
          path: `/calendars/${entityId}`,
          params: { start: start.format("YYYY-MM-DD"), end: end.format("YYYY-MM-DD") },
        });

        // Map events to include calendarId and group by their start date
        return events.map(event => ({
          day: dayjs(event.start.dateTime || event.start.date).format("YYYY-MM-DD"),
          dayEvent: { calendarId: entityId, event },
        }));
      });

      // Fetch all calendars in parallel
      const results = await Promise.all(promises);

      // Flatten results and group by date
      const groupedByDate = results.flat().reduce((acc, { day, dayEvent }) => {
        if (!acc[day]) {
          acc[day] = [];
        }
        acc[day].push(dayEvent);
        return acc;
      }, {} as Record<string, { calendarId: string; event: CalendarEventProps }[]>);

      // Transform grouped data into the desired format and sort by date
      return Object.entries(groupedByDate)
        .map(([day, dayEvents]) => ({ day: dayjs(day), dayEvents }))
        .sort((a, b) => a.day.diff(b.day));
    },
  });
};
