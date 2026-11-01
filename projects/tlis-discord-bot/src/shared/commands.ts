export interface CommandOption {
  name: string;
  description: string;
  kind: "integer";
  minimum: number;
  maximum: number;
}
export interface CommandRequest {
  integers: Readonly<Record<string, number | undefined>>;
}
export interface CommandReply { content: string; ephemeral?: boolean }
export interface CommandDefinition {
  name: string;
  description: string;
  options?: readonly CommandOption[];
}
export type CommandHandler = (request: CommandRequest) => Promise<CommandReply>;
export class CommandRegistry {
  private readonly commands = new Map<string, { definition: CommandDefinition; handle: CommandHandler }>();
  mapCommand(definition: CommandDefinition, handle: CommandHandler): void {
    if (this.commands.has(definition.name)) throw new Error("Duplicate command: " + definition.name);
    this.commands.set(definition.name, { definition, handle });
  }
  definitions(): CommandDefinition[] {
    return [...this.commands.values()].map(command => command.definition);
  }
  async execute(name: string, request: CommandRequest): Promise<CommandReply> {
    const command = this.commands.get(name);
    if (!command) return { content: "Unknown command. Use /help.", ephemeral: true };
    return command.handle(request);
  }
}
