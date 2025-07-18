// utils/star_config/selects/star_admin_role_select.js

const requireAdmin = require('../../permissions/requireAdmin');
const { configManager } = require('../../configManager');
const { logAndReplyError } = require('../../errorHelper');
const { createStarConfigEmbed } = require('../../embedHelper');

module.exports = {
  // このIDは、コマンドファイル内のidManagerによって生成されたものと一致する必要があります。
  customId: 'star_config:admin_role_select',
  handle: requireAdmin(actualHandler),
};

/**
 * 実際の処理を行う関数
 * @param {import('discord.js').RoleSelectMenuInteraction} interaction
 */
async function actualHandler(interaction) {
  try {
    // インタラクションが失敗しないように承認します。
    // ユーザーには「Botは考え中...」というメッセージは表示されません。
    await interaction.deferUpdate();

    const { guild, guildId, values: selectedRoleIds } = interaction;

    const currentConfig = await configManager.getSectionConfig(guildId, 'star');
    const notifyChannelId = currentConfig?.notifyChannelId ?? null;

    // 設定を更新
    await configManager.updateSectionConfig(guildId, 'star', { adminRoleIds: selectedRoleIds });

    // エンベッド構築
    // 共通ヘルパー関数を使用してEmbedを生成
    const updatedEmbed = createStarConfigEmbed(guild, selectedRoleIds, notifyChannelId)
      .setFooter({ text: '✅ 管理者ロールが更新されました' })
      .setTimestamp();

    // 元のメッセージを更新。コンポーネントはそのまま維持する。
    const reply = await interaction.editReply({
      embeds: [updatedEmbed],
      components: interaction.message.components,
    });

    // 3分後に確認メッセージを削除
    setTimeout(async () => {
      try {
        await reply.delete();
        console.log(`[star_admin_role_select] 確認メッセージを自動削除しました (ID: ${reply.id})`);
      } catch (error) {
        // メッセージが既に手動で削除されている場合など
        if (error.code !== 10008) { // Unknown Message
          console.error(`[star_admin_role_select] 確認メッセージの削除に失敗しました:`, error);
        }
      }
    }, 3 * 60 * 1000); // 3分 = 180,000ミリ秒

  } catch (error) {
    // 一元化されたエラーハンドラを使用します。
    await logAndReplyError(interaction, error, '⚠️ ロール設定の更新中にエラーが発生しました。');
  }
}
