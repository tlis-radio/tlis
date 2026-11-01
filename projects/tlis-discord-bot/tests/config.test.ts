import { test } from "node:test";
import assert from "node:assert/strict";
import { readConfiguration } from "../src/config.js";

test("local default does not require external credentials", () => {
  const config = readConfiguration({});
  assert.equal(config.botEnabled, false);
  assert.equal(config.port, 3002);
});
test("enabled gateway requires valid credentials and guild", () => {
  assert.throws(() => readConfiguration({ BOT_ENABLED: "true" }), /requires/);
  assert.throws(() => readConfiguration({ DISCORD_GUILD_ID: "invalid" }), /snowflake/);
});
test("invalid ports, booleans, URLs, and time zones fail locally", () => {
  for (const env of [{ PORT: "3002garbage" }, { PORT: "0" }, { BOT_ENABLED: "yes" },
    { CALENDAR_ICS_URL: "http://example.com/events.ics" }, { CALENDAR_ICS_URL: "https://name:secret@example.com/x" },
    { CALENDAR_TIME_ZONE: "not-a-zone" }]) assert.throws(() => readConfiguration(env));
});
