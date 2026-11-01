# Bot endpoints and command contracts

| Interface | Contract |
| --- | --- |
| `GET /health` | 200 with process status and service name; no provider call |
| `GET /ready` | 200 if gateway is disabled or connected; 503 if enabled but disconnected |
| Discord `/ping` | Private `Pong!` reply |
| Discord `/help` | Private list of registered command definitions |
| Discord `/events [days]` | Private upcoming public calendar entries; integer 1-30 days, default 7 |

The HTTP app does not expose a calendar feed or command execution endpoint. Other routes return 404. Gateway command execution is guild-scoped. Calendar titles cannot trigger user, role, or everyone mentions.

The `CalendarService.listUpcoming` port receives `from`, `to`, and `limit`. It returns event IDs, titles, start/end dates, all-day flags, and timezones. The ICS adapter expands recurrences, excludes cancelled/private/confidential entries and excluded dates, sorts occurrences, and applies the result limit. The command requests at most ten events and keeps the reply within Discord's content budget.

Feed requests use HTTPS, a five-second timeout, no redirects, and at most 1 MiB of input. The parsing boundary permits at most a 31-day query span and limits count to 25; the command's public settings are narrower. Unconfigured and temporarily unavailable providers produce distinct private responses.

Command registration replaces this application's commands only in the configured development guild. Preview is read-only; the registration script performs the external PUT only when called with `--apply`. The normal gateway startup does not mutate definitions.
