import type { CommandRegistry } from "../../shared/commands.js";
export function mapHelpCommand(commands: CommandRegistry): void {
  commands.mapCommand({ name: "help", description: "Show TLIS bot commands." },
    async () => ({ content: commands.definitions().map(item => "/" + item.name + " — " + item.description).join("\n"), ephemeral: true }));
}
