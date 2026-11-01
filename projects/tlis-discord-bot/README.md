# TLIS Discord bot

## Project references

[Documentation index](docs/README.md) routes to architecture, API/service contracts, configuration, and development. Agent task routing is in [CONTEXT.md](CONTEXT.md); deterministic maintenance programs live in `scripts/`, while workflow/stage `tools/` directories describe external capabilities.

A TypeScript starter arranged like a C# Minimal API application with Vertical Slice Architecture. The composition root maps small HTTP endpoints and Discord commands. Feature handlers depend on explicit service interfaces; external SDKs stay in adapters.

## Included behavior

- `GET /health`: process health, with no external calls.
- `GET /ready`: returns 503 while an enabled Discord gateway is disconnected.
- `/ping` and `/help`: basic private responses.
- `/events [days]`: upcoming public calendar entries, with a read-only HTTPS iCalendar adapter, recurrence expansion, excluded-date handling, and cancellation/private-event filtering.
- `CalendarService`: a provider-independent port for later Google Calendar API, Microsoft Graph, Directus, or other adapters.

The current adapter reads an ICS export, such as a Google or Outlook subscription feed. OAuth APIs, scheduled announcements, moderation, and voice playback are not implemented in this starter. No Discord command is registered during startup.

## Local development

Use Node 24.17 or later in the Node 24 line.

```sh
npm ci
cp .env.example .env
npm run check
npm run dev
```

With the example configuration, the HTTP server binds to `127.0.0.1:3002` and Discord stays disabled. You can check `http://127.0.0.1:3002/health` without a Discord token or calendar service.

To connect a development guild, create a Discord application and bot, add it to the guild with `bot` and `applications.commands` scopes, and set `DISCORD_TOKEN`, `DISCORD_APPLICATION_ID`, and `DISCORD_GUILD_ID`. This draft needs only the Guilds gateway intent; Message Content and member intents are unnecessary.

Preview the slash-command manifest first:

```sh
npm run commands
```

When you intend to replace this application's commands in the configured development guild:

```sh
npm run commands -- --apply
```

Then set `BOT_ENABLED=true` and start the bot. Registration is a separate explicit operation because Discord commands need updating only when their definitions change. Keep development and production application credentials separate.

## Calendar configuration

Set `CALENDAR_ICS_URL` to an HTTPS calendar subscription URL. The bot reads the feed when `/events` runs; it does not write calendar entries. `CALENDAR_TIME_ZONE` controls timed-event display and defaults to `Europe/Bratislava`. All-day events use the date/time zone carried by the feed.

Use a calendar intended for the configured Discord guild. Feed URLs can contain private access tokens, so keep `.env` out of Git. Public or unspecified-class event titles can be shown to guild members through `/events`; private and confidential events are excluded. Replies are ephemeral and external event titles cannot trigger mentions. The HTTP server exposes no calendar endpoint.

Requests time out after five seconds, follow no redirects, and accept at most 1 MiB of calendar text. The look-ahead window is limited to 30 days and results to ten entries. Configure a trusted feed with ordinary calendar recurrence rules; this draft has no feed cache, OAuth refresh flow, or background sync.

## Structure

```text
src/
  app.ts                          # Composition root: map endpoints and commands
  features/
    health/endpoint.ts            # HTTP slice
    ping/slice.ts                 # Discord command slice
    help/slice.ts
    calendar/upcoming-events.ts   # Request, validation, handler, registration
  integrations/
    calendar/calendar-service.ts  # Port and result contract
    calendar/ics-calendar-service.ts
    discord/                     # Gateway + slash-command serialization
  shared/                        # Small transport-neutral routing primitives
tools/                           # Predictable checks and command registration
workflows/add-feature/           # Numbered, inspectable ICM stage contracts
tests/                           # Offline integration and handler checks
```

Add a feature folder and one registration call in `app.ts`. Share code only when multiple slices actually need the same behavior. To integrate another calendar provider, implement `CalendarService`, select it in `index.ts`, and reuse the existing calendar slice.

## Container

```sh
docker compose config --quiet
docker compose up --build -d
```

The Compose port is bound to localhost. Inside the container the HTTP server uses `0.0.0.0`. Preserve the project's `.env` file outside images and build contexts. Production hosting, Discord application credentials, and real calendar access must be supplied by the team.

## Sources

- [Discord.js documentation](https://discord.js.org/docs/packages/discord.js/main)
- [Discord command registration guide](https://discordjs.guide/legacy/app-creation/deploying-commands)
- [node-ical parser and recurrence API](https://github.com/jens-maus/node-ical)
