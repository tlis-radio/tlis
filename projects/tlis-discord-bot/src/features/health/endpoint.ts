import type { HttpApp } from "../../shared/http.js";
export interface BotState { enabled: boolean; connected: boolean }
export function mapHealthEndpoints(app: HttpApp, state: () => BotState): void {
  app.mapGet("/health", () => ({ status: 200, body: { status: "ok", service: "tlis-discord-bot" } }));
  app.mapGet("/ready", () => {
    const current = state();
    const ready = !current.enabled || current.connected;
    return { status: ready ? 200 : 503, body: { status: ready ? "ready" : "not-ready", discordEnabled: current.enabled } };
  });
}
