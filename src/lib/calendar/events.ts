import { wedding } from "@/content/wedding";
import type { CalendarEvent } from "./ics";

const { groom, bride } = wedding.couple;
const couple = `${groom.nickname} & ${bride.nickname}`;

export const calendarEvents: CalendarEvent[] = wedding.events.map((e) => ({
  uid: `${e.id}-raihan-andini-20291024@undangan`,
  title: `${e.title} ${couple}`,
  start: e.start,
  end: e.end,
  location: `${e.venue}, ${e.address}`,
  description: `${e.title} ${couple}. Peta: ${e.mapsUrl}`,
  url: e.mapsUrl,
}));
