// utils/errorHelper.js
/**
 * 共通エラーハンドリング・ユーザー通知
 * @param {import('discord.js').Interaction} interaction
 * @param {string|Error} logMsg - ログ出力�E容
 * @param {string} userMsg - ユーザー向けエラーメチE��ージ
 * @param {object} [opts] - interaction.reply追加オプション
 */
async function logAndReplyError(interaction, logMsg, userMsg, opts = {}) {
  if (logMsg instanceof Error) {
    console.error(logMsg.stack || logMsg);
  } else {
    console.error(logMsg);
  }
  if (!interaction.replied && !interaction.deferred) {
    return interaction.reply({
      content: userMsg,
      ephemeral: true,
      ...opts
    });
  }
}

module.exports = { logAndReplyError };
