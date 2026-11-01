import ical from "node-ical";
import type { CalendarEvent, CalendarService, UpcomingEventsQuery } from "./calendar-service.js";
import { CalendarUnavailableError } from "./calendar-service.js";

const MAX_BYTES = 1_048_576;
function textValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "val" in value) return String(value.val);
  return "";
}
export async function parseUpcomingEvents(source: string, query: UpcomingEventsQuery): Promise<CalendarEvent[]> {
  if (!source.includes("BEGIN:VCALENDAR") || Buffer.byteLength(source) > MAX_BYTES) {
    throw new CalendarUnavailableError();
  }
  if (!Number.isFinite(query.from.getTime()) || !Number.isFinite(query.to.getTime()) ||
      query.to <= query.from || query.to.getTime() - query.from.getTime() > 31 * 86_400_000 ||
      !Number.isInteger(query.limit) || query.limit < 1 || query.limit > 25) {
    throw new Error("Invalid calendar query");
  }
  const components = await ical.async.parseICS(source);
  const events: CalendarEvent[] = [];
  for (const component of Object.values(components)) {
    if (!component || component.type !== "VEVENT") continue;
    if (component.status === "CANCELLED" || component.class === "PRIVATE" || component.class === "CONFIDENTIAL") continue;
    for (const instance of ical.expandRecurringEvent(component, { from: query.from, to: query.to })) {
      const event = instance.event;
      if (event.status === "CANCELLED" || event.class === "PRIVATE" || event.class === "CONFIDENTIAL") continue;
      if (instance.start < query.from || instance.start >= query.to) continue;
      events.push({
        id: component.uid + ":" + instance.start.toISOString(),
        title: textValue(instance.summary) || "Untitled event",
        startsAt: instance.start, endsAt: instance.end, allDay: instance.isFullDay,
        // DATE values without TZID are parsed in the runtime's local zone by node-ical.
        // Retain that zone so an all-day date never shifts to the previous UTC day.
        timeZone: instance.start.tz ?? (instance.isFullDay
          ? Intl.DateTimeFormat().resolvedOptions().timeZone : "UTC"),
      });
    }
  }
  return events.sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime() || a.id.localeCompare(b.id))
    .slice(0, query.limit);
}
export class IcsCalendarService implements CalendarService {
  constructor(private readonly url: string, private readonly fetcher: typeof fetch = fetch) {}
  async listUpcoming(query: UpcomingEventsQuery): Promise<CalendarEvent[]> {
    try {
      const response = await this.fetcher(this.url, {
        signal: AbortSignal.timeout(5_000), redirect: "error",
        headers: { Accept: "text/calendar", "User-Agent": "tlis-discord-bot/0.1" },
      });
      if (!response.ok || !response.body) throw new CalendarUnavailableError();
      const chunks: Uint8Array[] = [];
      let size = 0;
      const reader = response.body.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          size += value.byteLength;
          if (size > MAX_BYTES) { await reader.cancel(); throw new CalendarUnavailableError(); }
          chunks.push(value);
        }
      } finally { reader.releaseLock(); }
      return await parseUpcomingEvents(Buffer.concat(chunks).toString("utf8"), query);
    } catch { throw new CalendarUnavailableError(); }
  }
}
