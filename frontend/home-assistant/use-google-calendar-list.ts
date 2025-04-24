import { useQuery } from "@tanstack/react-query";
import { useHomeAssistantServer } from "./client";
import { HomeAssistantKeys } from "./keys";

export type GoogleCalendar = {
  name: string;
  entity_id: string;
};

export const useGoogleCalendarList = () => {
  const { fetch, enabled } = useHomeAssistantServer();
  return useQuery({
    queryKey: HomeAssistantKeys.googleCalendarList,
    enabled,
    queryFn: async () => fetch<GoogleCalendar[]>({ path: "/calendars" }),
  });
};
