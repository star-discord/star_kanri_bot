const { MessageFlags } = require('discord.js');
const { readJSON, ensureGuildJSON } = require('../fileHelper');

/**
 * 管理者権限チェック用ミドルウェア
 * @param {Function} executeFunction - 実行する関数
 * @returns {Function} - ラップされた実行関数
 */
function requireAdmin(executeFunction) {
  return async (interaction) => {
    const guildId = interaction.guildId;
    const userId = interaction.user.id;
    const member = interaction.member;

    try {
      // 設定ファイル読み込み
      const filePath = await ensureGuildJSON(guildId);
      const data = await readJSON(filePath);

      // データ構造の互換性確保
      let adminRoleIds = [];
      if (data.star_config?.adminRoleIds) {
        adminRoleIds = data.star_config.adminRoleIds;
      } else if (data.adminRoleIds) {
        adminRoleIds = data.adminRoleIds;
      }

      // 管理者権限チェック
      const hasAdminRole = adminRoleIds.some(roleId => 
        member.roles.cache.has(roleId)
      );

      if (!hasAdminRole) {
        return await interaction.reply({
          content: '❌ あなたには権限がありません。',
          flags: MessageFlags.Ephemeral
        });
      }

      // 権限があれば元の関数を実行
      return await executeFunction(interaction);

    } catch (error) {
      console.error('requireAdmin エラー:', error);
      return await interaction.reply({
        content: '❌ 権限チェック中にエラーが発生しました。',
        flags: MessageFlags.Ephemeral
      });
    }
  };
}

module.exports = requireAdmin;

