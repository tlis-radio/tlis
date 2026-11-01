import type { CommandRegistry, CommandReply, CommandRequest } from "../../shared/commands.js";
import { CalendarNotConfiguredError, type CalendarService } from "../../integrations/calendar/calendar-service.js";

export function createUpcomingEventsHandler(calendar: CalendarService, timeZone: string, now: () => Date = () => new Date()) {
  return async (request: CommandRequest): Promise<CommandReply> => {
    const days = request.integers.days ?? 7;
    if (!Number.isInteger(days) || days < 1 || days > 30) {
      return { content: "Choose a whole number of days from 1 to 30.", ephemeral: true };
    }
    const from = now();
    try {
      const events = await calendar.listUpcoming({ from, to: new Date(from.getTime() + days * 86_400_000), limit: 10 });
      if (!events.length) return { content: "No upcoming public calendar events in the next " + days + " days.", ephemeral: true };
      const format = new Intl.DateTimeFormat("en-GB", { timeZone, dateStyle: "medium", timeStyle: "short" });
      const dateFormat = (zone: string) => new Intl.DateTimeFormat("en-GB", { timeZone: zone, dateStyle: "medium" });
      const lines = events.map(event => {
        const title = event.title.replace(/[\r\n]/g, " ").slice(0, 120);
        const when = event.allDay ? dateFormat(event.timeZone).format(event.startsAt) + " (all day)" : format.format(event.startsAt);
        return "• " + when + " — " + title;
      });
      return { content: ("Upcoming events (" + timeZone + "):\n" + lines.join("\n")).slice(0, 1900), ephemeral: true };
    } catch (error) {
      return { content: error instanceof CalendarNotConfiguredError
        ? "Calendar integration is not configured yet."
        : "The calendar is temporarily unavailable. Please try again later.", ephemeral: true };
    }
  };
}
export function mapUpcomingEventsCommand(commands: CommandRegistry, calendar: CalendarService, timeZone: string): void {
  commands.mapCommand({
    name: "events", description: "List upcoming public TLIS calendar events.",
    options: [{ name: "days", description: "Look ahead 1 to 30 days (default 7).", kind: "integer", minimum: 1, maximum: 30 }],
  }, createUpcomingEventsHandler(calendar, timeZone));
}
