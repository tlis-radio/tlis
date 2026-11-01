import { REST, Routes } from "discord.js";
import { buildApplication } from "../src/app.js";
import { readConfiguration } from "../src/config.js";
import { UnconfiguredCalendarService } from "../src/integrations/calendar/calendar-service.js";
import { toDiscordCommands } from "../src/integrations/discord/command-definitions.js";

async function main() {
  const args = process.argv.slice(2);
  if (args.some(arg => arg !== "--apply") || args.length > 1) throw new Error("Usage: npm run commands -- [--apply]");
  const config = readConfiguration(process.env);
  const app = buildApplication({ calendar: new UnconfiguredCalendarService(), timeZone: config.calendarTimeZone,
    botState: () => ({ enabled: false, connected: false }) });
  const commands = toDiscordCommands(app.commands.definitions());
  if (!args.includes("--apply")) { console.log(JSON.stringify(commands, null, 2)); return; }
  if (!config.discordToken || !config.discordApplicationId || !config.discordGuildId) {
    throw new Error("Applying requires DISCORD_TOKEN, DISCORD_APPLICATION_ID, and DISCORD_GUILD_ID");
  }
  // Explicit guild-only mutation; no registration occurs during normal startup.
  await new REST({ version: "10" }).setToken(config.discordToken).put(
    Routes.applicationGuildCommands(config.discordApplicationId, config.discordGuildId), { body: commands });
  console.log("Registered " + commands.length + " commands in the configured development guild.");
}
main().catch(() => { console.error("Command registration failed. Check arguments, credentials, and guild access."); process.exitCode = 1; });
