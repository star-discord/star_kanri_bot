const { MessageFlagsBitField } = require('discord.js');
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
      const hasDiscordAdminPermission = member.permissions.has('Administrator');
      const hasAdminRole = adminRoleIds.some(roleId => 
        member.roles.cache.has(roleId)
      );

      // Discord標準の管理者権限または設定済みの管理者ロールをチェック
      if (!hasDiscordAdminPermission && !hasAdminRole) {
        return await interaction.reply({
          content: '❌ あなたには権限がありません。\n' +
                  (adminRoleIds.length === 0 
                    ? 'Discord の管理者権限を持つユーザーが `/star管理bot設定` で管理者ロールを設定してください。'
                    : '設定された管理者ロールまたは Discord の管理者権限が必要です。'),
          flags: MessageFlagsBitField.Ephemeral
        });
      }

      // 権限があれば元の関数を実行
      return await executeFunction(interaction);

    } catch (error) {
      console.error('requireAdmin エラー:', error);
      return await interaction.reply({
        content: '❌ 権限チェック中にエラーが発生しました。',
        flags: MessageFlagsBitField.Ephemeral
      });
    }
  };
}

module.exports = requireAdmin;

