import { Client, Events, GatewayIntentBits, MessageFlags } from "discord.js";
import type { CommandRegistry } from "../../shared/commands.js";
export function createDiscordGateway(commands: CommandRegistry, guildId: string) {
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });
  client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;
    try {
      if (interaction.guildId !== guildId) {
        await interaction.reply({ content: "This bot is configured for another server.", flags: MessageFlags.Ephemeral });
        return;
      }
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      const definition = commands.definitions().find(item => item.name === interaction.commandName);
      const integers: Record<string, number | undefined> = {};
      for (const option of definition?.options ?? []) integers[option.name] = interaction.options.getInteger(option.name) ?? undefined;
      const reply = await commands.execute(interaction.commandName, { integers });
      // Calendar values are external input: never permit @everyone/role/user mentions.
      await interaction.editReply({ content: reply.content, allowedMentions: { parse: [] } });
    } catch {
      console.error("Discord command failed.");
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({ content: "The command could not be completed.", allowedMentions: { parse: [] } }).catch(() => undefined);
      } else {
        await interaction.reply({ content: "The command could not be completed.", flags: MessageFlags.Ephemeral }).catch(() => undefined);
      }
    }
  });
  client.on(Events.Error, () => console.error("Discord gateway error."));
  return {
    connect: (token: string) => client.login(token),
    connected: () => client.isReady(),
    close: () => client.destroy(),
  };
}
