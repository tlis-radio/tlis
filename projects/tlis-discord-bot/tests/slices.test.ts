import { test } from "node:test";
import assert from "node:assert/strict";
import { buildApplication } from "../src/app.js";
import { createUpcomingEventsHandler } from "../src/features/calendar/upcoming-events.js";
import { UnconfiguredCalendarService } from "../src/integrations/calendar/calendar-service.js";

test("slices are registered at composition root", async () => {
  const app = buildApplication({ calendar: new UnconfiguredCalendarService(), timeZone: "Europe/Bratislava",
    botState: () => ({ enabled: false, connected: false }) });
  assert.equal((await app.commands.execute("ping", { integers: {} })).content, "Pong!");
  assert.match((await app.commands.execute("help", { integers: {} })).content, /\/events/);
  assert.match((await app.commands.execute("events", { integers: {} })).content, /not configured/);
});
test("calendar slice bounds queries and handles upstream failure", async () => {
  let requests = 0;
  const handler = createUpcomingEventsHandler({ async listUpcoming(query) {
    requests++;
    assert.equal(query.from.toISOString(), "2026-11-01T10:00:00.000Z");
    assert.equal(query.to.toISOString(), "2026-11-08T10:00:00.000Z");
    throw new Error("https://secret-calendar-url");
  } }, "UTC", () => new Date("2026-11-01T10:00:00Z"));
  assert.match((await handler({ integers: { days: 31 } })).content, /1 to 30/);
  assert.equal(requests, 0);
  const result = await handler({ integers: {} });
  assert.match(result.content, /temporarily unavailable/);
  assert.doesNotMatch(result.content, /secret/);
});
test("calendar output fits Discord and stays private", async () => {
  const handler = createUpcomingEventsHandler({ async listUpcoming() {
    return [{ id: "x", title: "Program\n".repeat(500), startsAt: new Date("2026-11-02T12:00Z"),
      endsAt: new Date("2026-11-02T13:00Z"), allDay: false, timeZone: "UTC" }];
  } }, "Europe/Bratislava");
  const result = await handler({ integers: {} });
  assert.equal(result.ephemeral, true);
  assert.ok(result.content.length <= 1900);
});
