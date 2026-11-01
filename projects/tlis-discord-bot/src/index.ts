import { buildApplication } from "./app.js";
import { readConfiguration } from "./config.js";
import { IcsCalendarService } from "./integrations/calendar/ics-calendar-service.js";
import { UnconfiguredCalendarService } from "./integrations/calendar/calendar-service.js";
import { createDiscordGateway } from "./integrations/discord/gateway.js";

async function main() {
  const config = readConfiguration(process.env);
  let gateway: ReturnType<typeof createDiscordGateway> | undefined;
  const application = buildApplication({
    calendar: config.calendarUrl ? new IcsCalendarService(config.calendarUrl) : new UnconfiguredCalendarService(),
    timeZone: config.calendarTimeZone,
    botState: () => ({ enabled: config.botEnabled, connected: gateway?.connected() ?? false }),
  });
  const server = application.http.createServer();
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(config.port, config.host, resolve);
  });
  console.log("TLIS bot HTTP server listening on " + config.host + ":" + config.port);
  const shutdown = () => { gateway?.close(); server.close(); };
  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
  if (config.botEnabled) {
    gateway = createDiscordGateway(application.commands, config.discordGuildId!);
    try { await gateway.connect(config.discordToken!); }
    catch { shutdown(); throw new Error("Discord connection failed. Check the configured credentials and access."); }
    console.log("Discord gateway connected.");
  } else {
    console.log("Discord is disabled. Set BOT_ENABLED=true after configuring a development guild.");
  }
}
main().catch(error => { console.error(error instanceof Error ? error.message : "Bot startup failed."); process.exitCode = 1; });
