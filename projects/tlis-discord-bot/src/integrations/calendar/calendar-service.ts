export interface CalendarEvent {
  id: string;
  title: string;
  startsAt: Date;
  endsAt: Date;
  allDay: boolean;
  timeZone: string;
}
export interface UpcomingEventsQuery { from: Date; to: Date; limit: number }
/** Port: add a Google Calendar or Microsoft Graph adapter without changing a slice. */
export interface CalendarService {
  listUpcoming(query: UpcomingEventsQuery): Promise<CalendarEvent[]>;
}
export class CalendarNotConfiguredError extends Error {
  constructor() { super("Calendar integration is not configured."); }
}
export class CalendarUnavailableError extends Error {
  constructor() { super("Calendar integration is temporarily unavailable."); }
}
export class UnconfiguredCalendarService implements CalendarService {
  async listUpcoming(): Promise<CalendarEvent[]> { throw new CalendarNotConfiguredError(); }
}
