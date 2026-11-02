# Bot configuration

| Variable | Default or requirement |
| --- | --- |
| `HOST` | `127.0.0.1` locally |
| `PORT` | `3002`; integer 1-65535 |
| `BOT_ENABLED` | `false`; only exact true/false values accepted |
| `DISCORD_TOKEN` | Required when enabling the gateway or applying commands |
| `DISCORD_APPLICATION_ID` | Required for enabled configuration and registration |
| `DISCORD_GUILD_ID` | Configured development guild; snowflake validation |
| `CALENDAR_ICS_URL` | Optional HTTPS subscription URL without URL user credentials |
| `CALENDAR_TIME_ZONE` | `Europe/Bratislava`; validated IANA timezone |

Calendar subscription URLs can contain access tokens. Keep them private even if the feed's event class is public. Public or unclassified event titles from the configured feed can be shown to members of the configured guild; private/confidential entries are excluded.

The calendar timezone controls timed-event display; all-day dates retain the feed/runtime calendar-date semantics described in the adapter. Use a feed intended for this guild. No OAuth provider credentials, calendar writes, or scheduled announcements are configured by this draft.

Compose loads the local `.env` and binds host port 3002 to localhost; the container listens on 0.0.0.0. The image excludes local environments and runs as the node user. Local `npm run dev` starts the HTTP service with Discord disabled by default.
