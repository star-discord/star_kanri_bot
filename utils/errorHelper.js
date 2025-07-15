// utils/errorHelper.js
/**
 * 共通エラーハンドリング・ユーザー通知
 * @param {import('discord.js').Interaction} interaction
 * @param {string|Error} logMsg - ログ出力内容
 * @param {string} userMsg - ユーザー向けエラーメッセージ
 * @param {object} [opts] - interaction.reply追加オプション
 */
const { MessageFlagsBitField } = require('discord.js');
async function logAndReplyError(interaction, logMsg, userMsg, opts = {}) {
  if (logMsg instanceof Error) {
    console.error(logMsg.stack || logMsg);
  } else {
    console.error(logMsg);
  }

  // 二重応答を避けつつ、安全にエラーメッセージを送信する
  try {
    const payload = { content: userMsg, embeds: [], components: [], ...opts };

    if (interaction.deferred) {
      // deferReply済みならeditReply
      await interaction.editReply(payload);
    } else if (!interaction.replied) {
      // まだreplyもdeferもしていなければreply
      await interaction.reply({ ...payload, flags: MessageFlagsBitField.Flags.Ephemeral });
    }
    // interaction.repliedがtrueの場合は、既に応答済みのため何もしない
    // (showModal成功後や、ハンドラ内で既に応答した場合など)
  } catch (replyError) {
    console.error(`❌ エラー応答の送信に失敗しました (Interaction ID: ${interaction.id})`, replyError.message);
  }
}

module.exports = { logAndReplyError };
