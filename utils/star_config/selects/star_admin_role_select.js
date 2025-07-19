// utils/star_config/selects/star_admin_role_select.js
const { configManager } = require('../../configManager');
const { logAndReplyError } = require('../../errorHelper');
const { createStarConfigEmbed, createAdminRejectEmbed } = require('../../embedHelper');
const { checkAdmin } = require('../../permissions/checkAdmin');
const { safeFollowUp } = require('../../safeReply');

/**
 * 実際の処理を行う関数
 * @param {import('discord.js').RoleSelectMenuInteraction} interaction
 */
async function actualHandler(interaction) {
  try {
    // インタラクションが失敗しないように承認します。
    // ユーザーには「Botは考え中...」というメッセージは表示されません。
    await interaction.deferUpdate();

    const isAdmin = await checkAdmin(interaction);
    if (!isAdmin) {
      return await safeFollowUp(interaction, { embeds: [createAdminRejectEmbed()], ephemeral: true });
    }

    const { guild, guildId, values: selectedRoleIds } = interaction;

    const currentConfig = await configManager.getSectionConfig(guildId, 'star');
    const notifyChannelId = currentConfig?.notifyChannelId ?? null;

    // 設定を更新
    await configManager.updateSectionConfig(guildId, 'star', { adminRoleIds: selectedRoleIds });

    // 共通ヘルパー関数を使用してEmbedを生成
    const updatedEmbed = createStarConfigEmbed(guild, selectedRoleIds, notifyChannelId);

    // 元のメッセージを更新。コンポーネントはそのまま維持する。
    await interaction.editReply({
      embeds: [updatedEmbed],
      components: interaction.message.components,
    });

  } catch (error) {
    // 一元化されたエラーハンドラを使用します。
    await logAndReplyError(interaction, error, '⚠️ ロール設定の更新中にエラーが発生しました。');
  }
}

module.exports = {
  // このIDは、コマンドファイル内のidManagerによって生成されたものと一致する必要があります。
  customId: 'star_config:admin_role_select',
  handle: actualHandler,
};
