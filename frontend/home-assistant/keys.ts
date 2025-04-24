export namespace HomeAssistantKeys {
  export const root = ["homeAssistant"];

  export const googleCalendar = [...HomeAssistantKeys.root, "googleCalendar"];

  export const googleCalendarEventList = (entityIdList: string[], start: string, end: string) => [
    ...HomeAssistantKeys.googleCalendar,
    "eventList",
    { entityIdList, start, end },
  ];

  export const googleCalendarList = [...HomeAssistantKeys.googleCalendar, "calendarList"];

  export const states = [...HomeAssistantKeys.root, "states"];

  export const template = (key: string) => [...HomeAssistantKeys.root, key];
}
