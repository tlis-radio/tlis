import { CommandRegistry } from "./shared/commands.js";
import { HttpApp } from "./shared/http.js";
import { mapHealthEndpoints, type BotState } from "./features/health/endpoint.js";
import { mapPingCommand } from "./features/ping/slice.js";
import { mapHelpCommand } from "./features/help/slice.js";
import { mapUpcomingEventsCommand } from "./features/calendar/upcoming-events.js";
import type { CalendarService } from "./integrations/calendar/calendar-service.js";

export interface ApplicationDependencies {
  calendar: CalendarService;
  timeZone: string;
  botState: () => BotState;
}
/** Composition root: feature registration resembles MapGet / MapGroup in Minimal APIs. */
export function buildApplication(dependencies: ApplicationDependencies) {
  const http = new HttpApp();
  const commands = new CommandRegistry();
  mapHealthEndpoints(http, dependencies.botState);
  mapPingCommand(commands);
  mapUpcomingEventsCommand(commands, dependencies.calendar, dependencies.timeZone);
  mapHelpCommand(commands);
  return { http, commands };
}
