# Bot architecture

`src/app.ts` is the composition root. It maps HTTP endpoints and Discord commands by calling each slice's registration function, similar to Minimal API `MapGet`/route mapping in C#. Feature behavior lives under `src/features/`, rather than a horizontal controllers/services/repositories hierarchy.

The small `HttpApp` maps GET handlers. `CommandRegistry` holds transport-neutral definitions and handlers. Health, ping, help, and upcoming-calendar-events are separate slices. The calendar slice validates its look-ahead and formats a domain result without knowing Discord SDK details.

`CalendarService` is the external-service port. `IcsCalendarService` implements read-only HTTPS iCalendar input, while `UnconfiguredCalendarService` gives a clear response when no feed is supplied. Tests can inject a fake calendar and clock. A future Google Calendar or Microsoft Graph adapter implements the same port; OAuth refresh and background synchronization are not part of this draft.

The Discord adapter converts definitions into slash commands and maps gateway interactions to the registry. It restricts interactions to the configured guild, defers privately, and disables mention parsing on event text. Startup does not register commands. Registration is a separate script with an explicit apply switch.

The HTTP process can run without Discord credentials, with the gateway disabled by default. `/health` checks the process; `/ready` reflects whether an enabled gateway is connected. Deployment hosting and provider credentials remain external configuration.
