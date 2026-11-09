import { buildIcs } from "@/lib/calendar/ics";
import { calendarEvents } from "@/lib/calendar/events";

export const dynamic = "force-static";

/** GET /undangan.ics — akad & resepsi sekaligus, dengan pengingat H-1. */
export function GET() {
  return new Response(buildIcs(calendarEvents), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="undangan-raihan-andini.ics"',
      "Cache-Control": "public, max-age=3600",
    },
  });
}
