import { test } from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { buildApplication } from "../src/app.js";
import { UnconfiguredCalendarService } from "../src/integrations/calendar/calendar-service.js";

test("health and readiness endpoints report process/gateway separately", async () => {
  const state = { enabled: true, connected: false };
  const app = buildApplication({ calendar: new UnconfiguredCalendarService(), timeZone: "UTC", botState: () => state });
  const server = app.http.createServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  try {
    const address = server.address();
    assert.ok(address && typeof address !== "string");
    const base = "http://127.0.0.1:" + address.port;
    assert.equal((await fetch(base + "/health")).status, 200);
    assert.equal((await fetch(base + "/ready")).status, 503);
    state.connected = true;
    assert.equal((await fetch(base + "/ready")).status, 200);
    assert.equal((await fetch(base + "/calendar")).status, 404);
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
});
