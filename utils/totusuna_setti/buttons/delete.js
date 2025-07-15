// utils/totusuna_setti/buttons/delete.js

const { configManager } = require('../../configManager');
const { createSuccessEmbed, createErrorEmbed, createAdminRejectEmbed } = require('../../embedHelper');
const { MessageFlagsBitField } = require('discord.js');
const { checkAdmin } = require('../../permissions/checkAdmin');

module.exports = {
  customIdStart: 'totusuna_setti:delete:',

  /**
   * Deletes a "Totsuna" instance, including its message and data entry.
   * @param {import('discord.js').ButtonInteraction} interaction
   */
  async handle(interaction) {
    await interaction.deferReply({ flags: MessageFlagsBitField.Flags.Ephemeral });

    const isAdmin = await checkAdmin(interaction);
    if (!isAdmin) {
      return await interaction.editReply({ embeds: [createAdminRejectEmbed()] });
    }

    const { guild, customId } = interaction;
    // Use module.exports to avoid 'this' context issues.
    const uuid = customId.substring(module.exports.customIdStart.length);

    try {
      // First, get the instance data to find the message to delete.
      const instance = await configManager.getTotusunaInstance(guild.id, uuid);

      // Attempt to delete the associated Discord message if it exists.
      if (instance?.messageId && instance.installChannelId) {
        try {
          const channel = await guild.channels.fetch(instance.installChannelId);
          const message = await channel.messages.fetch(instance.messageId).catch(() => null);
          if (message) {
            await message.delete();
          }
        } catch (err) {
          console.warn(`[delete.js] Could not delete original message for instance ${uuid} in guild ${guild.id}:`, err.message);
          // This is not a fatal error; continue with data deletion.
        }
      }

      // Remove the instance from the configuration file using the centralized manager.
      const success = await configManager.removeTotusunaInstance(guild.id, uuid);

      if (success) {
        await interaction.editReply({
          embeds: [createSuccessEmbed('削除完了', '凸スナの設置データを削除しました。')],
        });
      } else {
        await interaction.editReply({
          embeds: [createErrorEmbed('削除失敗', '指定された凸スナが見つかりませんでした。データが既に削除されている可能性があります。')],
        });
      }
    } catch (err) {
      console.error(`[delete.js] Error deleting instance ${uuid} in guild ${guild.id}:`, err);
      await interaction.editReply({
        embeds: [createErrorEmbed('処理エラー', '凸スナの削除中に予期せぬエラーが発生しました。')],
      });
    }
  },
};
