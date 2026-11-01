export interface Configuration {
  host: string;
  port: number;
  botEnabled: boolean;
  discordToken: string | undefined;
  discordApplicationId: string | undefined;
  discordGuildId: string | undefined;
  calendarUrl: string | undefined;
  calendarTimeZone: string;
}
export function readConfiguration(env: NodeJS.ProcessEnv): Configuration {
  const botFlag = env.BOT_ENABLED ?? "false";
  if (!["true", "false"].includes(botFlag)) throw new Error("BOT_ENABLED must be true or false");
  const portText = env.PORT ?? "3002";
  if (!/^\d+$/.test(portText)) throw new Error("PORT must be an integer from 1 to 65535");
  const port = Number(portText);
  if (port < 1 || port > 65535) throw new Error("PORT must be an integer from 1 to 65535");
  const botEnabled = botFlag === "true";
  const token = env.DISCORD_TOKEN?.trim() || undefined;
  const applicationId = env.DISCORD_APPLICATION_ID?.trim() || undefined;
  const guildId = env.DISCORD_GUILD_ID?.trim() || undefined;
  for (const [key, value] of [["DISCORD_APPLICATION_ID", applicationId], ["DISCORD_GUILD_ID", guildId]]) {
    if (value && !/^\d{17,22}$/.test(value)) throw new Error(key + " must be a Discord snowflake ID");
  }
  if (botEnabled && (!token || !applicationId || !guildId)) {
    throw new Error("Enabling Discord requires DISCORD_TOKEN, DISCORD_APPLICATION_ID, and DISCORD_GUILD_ID");
  }
  const calendarUrl = env.CALENDAR_ICS_URL?.trim() || undefined;
  if (calendarUrl) {
    let parsed: URL;
    try { parsed = new URL(calendarUrl); } catch { throw new Error("CALENDAR_ICS_URL must be a valid HTTPS URL"); }
    if (parsed.protocol !== "https:" || parsed.username || parsed.password) {
      throw new Error("CALENDAR_ICS_URL must use HTTPS without URL user credentials");
    }
  }
  const calendarTimeZone = env.CALENDAR_TIME_ZONE?.trim() || "Europe/Bratislava";
  try { new Intl.DateTimeFormat("en-GB", { timeZone: calendarTimeZone }); }
  catch { throw new Error("CALENDAR_TIME_ZONE must be a valid IANA time zone"); }
  return { host: env.HOST?.trim() || "127.0.0.1", port, botEnabled,
    discordToken: token, discordApplicationId: applicationId, discordGuildId: guildId,
    calendarUrl, calendarTimeZone };
}
