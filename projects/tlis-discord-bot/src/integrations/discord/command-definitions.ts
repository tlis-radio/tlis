import { SlashCommandBuilder } from "discord.js";
import type { CommandDefinition } from "../../shared/commands.js";
export function toDiscordCommands(definitions: readonly CommandDefinition[]) {
  return definitions.map(definition => {
    const command = new SlashCommandBuilder().setName(definition.name).setDescription(definition.description);
    for (const option of definition.options ?? []) {
      command.addIntegerOption(builder => builder.setName(option.name).setDescription(option.description)
        .setMinValue(option.minimum).setMaxValue(option.maximum).setRequired(false));
    }
    return command.toJSON();
  });
}
