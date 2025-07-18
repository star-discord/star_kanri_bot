// utils/star_config/selects/star_notify_channel_select.js

const requireAdmin = require('../../permissions/requireAdmin');
const { configManager } = require('../../configManager');
const { logAndReplyError } = require('../../errorHelper');
const { createStarConfigEmbed } = require('../../embedHelper');

/**
 * @param {import('discord.js').ChannelSelectMenuInteraction} interaction
 */
async function actualHandler(interaction) {
  try {
    // インタラクションが失敗しないように承認します。
    await interaction.deferUpdate();

    const { guild, guildId, values } = interaction;
    const selectedChannelId = values[0]; // チャンネル選択は単一選択です

    await configManager.updateSectionConfig(guildId, 'star', {
      notifyChannelId: selectedChannelId,
    });

    const newConfig = await configManager.getGuildConfig(guildId);
    const currentAdminRoleIds = newConfig.star?.adminRoleIds || [];

    // 共通ヘルパー関数を使用してEmbedを生成
    const updatedEmbed = createStarConfigEmbed(guild, currentAdminRoleIds, selectedChannelId)
      .setFooter({ text: '✅ 通知チャンネルが更新されました' })
      .setTimestamp();

    await interaction.editReply({
      embeds: [updatedEmbed],
      components: interaction.message.components,
    });

  } catch (error) {
    await logAndReplyError(interaction, error, '⚠️ 通知チャンネル設定中にエラーが発生しました。');
  }
}

module.exports = {
  customId: 'star_config:notify_channel_select',
  handle: requireAdmin(actualHandler),
};
