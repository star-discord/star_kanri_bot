const { MessageFlagsBitField } = require('discord.js');
const { configManager } = require('../configManager');

/**
 * 管理者権限チェック用ミドルウェア
 * このミドルウェアでラップされたハンドラは、実行前に管理者権限をチェックします。
 * @param {Function} executeFunction - 実行する関数
 * @returns {Function} - ラップされた実行関数
 */
function requireAdmin(executeFunction) {
  return async (interaction) => {
    // インタラクションがギルド内で行われたか、memberオブジェクトが存在するかを確認
    if (!interaction.inGuild() || !interaction.member) {
      // DMなど、サーバー外からの実行を防止
      return interaction.reply({
        content: '❌ この操作はサーバー内でのみ実行できます。',
        flags: MessageFlagsBitField.Flags.Ephemeral
      });
    }

    let isAdmin = false;
    try {
      // configManagerを使用して、安全かつ一元的に権限をチェック
      isAdmin = await configManager.isStarAdmin(interaction.guildId, interaction.member);
    } catch (error) {
      console.error('❌ requireAdmin: isStarAdminの権限チェック中にエラー:', error);
      return interaction.reply({
        content: '❌ 権限チェック中にエラーが発生しました。',
        flags: MessageFlagsBitField.Flags.Ephemeral
      });
    }

    if (!isAdmin) {
      return interaction.reply({
        content: '❌ あなたには権限がありません。\n' +
                 'この操作には、サーバーの管理者権限またはBotで設定された管理者ロールが必要です。',
        flags: MessageFlagsBitField.Ephemeral
      });
    }

    // 権限チェックをパスしたので、元の関数を実行
    // 元の関数内で発生したエラーは、呼び出し元の interactionCreate ハンドラでキャッチされます
    return executeFunction(interaction);
  };
}

module.exports = requireAdmin;
