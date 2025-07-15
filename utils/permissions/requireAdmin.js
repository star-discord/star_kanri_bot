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

    try {
      const isAdmin = await configManager.isStarAdmin(interaction.guildId, interaction.member);

      if (!isAdmin) {
        return interaction.reply({
          content: '❌ あなたには権限がありません。\n' +
                   'この操作には、サーバーの管理者権限またはBotで設定された管理者ロールが必要です。',
          flags: MessageFlagsBitField.Flags.Ephemeral
        });
      }

      // 権限チェックをパスしたので、元の関数を実行
      return await executeFunction(interaction);

    } catch (error) {
      // isStarAdmin または executeFunction が投げたエラーをここでキャッチ
      console.error(`❌ requireAdmin: 保護された処理 (${interaction.commandName || interaction.customId}) の実行中にエラー:`, error);
      
      const errorMessage = { content: '❌ 処理中に予期せぬエラーが発生しました。' };
      
      try {
        if (interaction.deferred) {
          await interaction.editReply(errorMessage);
        } else if (!interaction.replied) {
          await interaction.reply({ ...errorMessage, flags: MessageFlagsBitField.Flags.Ephemeral });
        }
      } catch (replyError) {
        console.error('❌ requireAdmin: エラー応答の送信にも失敗:', replyError);
      }
    }
  };
}

module.exports = requireAdmin;
