// utils/totusuna_setti/buttons/delete.js
const fs = require('fs');
const path = require('path');
const { MessageFlags } = require('discord.js');

module.exports = {
  customIdStart: 'totsusuna_setti:delete:',

  /**
   * Handles the deletion of a Totsusuna instance.
   * @param {import('discord.js').ButtonInteraction} interaction
   */
  async handle(interaction) {
    const guildId = interaction.guildId;
    const uuid = interaction.customId.replace(this.customIdStart, '');
    const filePath = path.join(__dirname, '../../../data', guildId, `${guildId}.json`);

    if (!fs.existsSync(filePath)) {
      return await interaction.reply({
        content: '⚠�E�EData file not found.',
        flags: MessageFlagsBitField.Ephemeral,
      });
    }

    const json = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const list = json.totsusuna?.instances;

    if (!Array.isArray(list)) {
      return await interaction.reply({
        content: '⚠�E�ENo instance data available.',
        flags: MessageFlagsBitField.Ephemeral,
      });
    }

    const targetIndex = list.findIndex(i => i.id === uuid);
    if (targetIndex === -1) {
      return await interaction.reply({
        content: '⚠�E�ETarget instance not found.',
        flags: MessageFlagsBitField.Ephemeral,
      });
    }

    const instance = list[targetIndex];

    // Try to delete the original message if available
    if (instance.messageId && instance.installChannelId) {
      try {
        const channel = await interaction.guild.channels.fetch(instance.installChannelId);
        const message = await channel.messages.fetch(instance.messageId);
        if (message) await message.delete();
      } catch (err) {
        console.warn(`[totsusuna_setti:delete] Failed to delete message: ${err.message}`);
      }
    }

    // Remove instance from the array and save
    list.splice(targetIndex, 1);
    fs.writeFileSync(filePath, JSON.stringify(json, null, 2));

    await interaction.reply({
      content: '🗑️ Totsusuna instance deleted successfully.',
      flags: MessageFlagsBitField.Ephemeral,
    });
  },
};
