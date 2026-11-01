import type { CommandRegistry } from "../../shared/commands.js";
export function mapPingCommand(commands: CommandRegistry): void {
  commands.mapCommand({ name: "ping", description: "Check that the TLIS bot responds." },
    async () => ({ content: "Pong!", ephemeral: true }));
}
