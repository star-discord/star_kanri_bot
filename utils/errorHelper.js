// utils/errorHelper.js
/**
 * 共通エラーハンドリング・ユーザー通知
 * @param {import('discord.js').Interaction} interaction
 * @param {string|Error} logMsg - ログ出力内容
 * @param {string} userMsg - ユーザー向けエラーメッセージ
 * @param {object} [opts] - interaction.reply追加オプション
 */
const { MessageFlagsBitField } = require('discord.js');
const fs = require('fs').promises;
const path = require('path');
const { safeReply } = require('./safeReply'); // safeReplyをインポート

/**
 * ログをファイルに追記する
 * @param {string} message
 */
async function logToFile(message) {
  try {
    const logDir = path.join(__dirname, '..', 'logs');
    await fs.mkdir(logDir, { recursive: true }); // logsディレクトリがなければ作成
    const logPath = path.join(logDir, 'error.log');
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] ${message}\n`;
    await fs.appendFile(logPath, formattedMessage, 'utf8');
  } catch (fileError) {
    console.error('❌ ログファイルへの書き込みに失敗:', fileError);
  }
}

async function logAndReplyError(interaction, logMsg, userMsg, opts = {}) {
  const sourceLabel = interaction.customId || interaction.commandName || 'unknown_interaction';
  const guildId = interaction.guildId ?? 'DM';
  const userId = interaction.user?.id ?? 'unknown_user';
  const errorMessage = logMsg instanceof Error ? logMsg.stack || logMsg.message : logMsg;

  if (logMsg instanceof Error) {
    console.error(`[${sourceLabel}]`, logMsg);
  } else {
    console.error(`[${sourceLabel}]`, logMsg);
  }
  // ファイルにもコンテキスト付きでログを記録
  await logToFile(`[Guild: ${guildId}] [User: ${userId}] [Source: ${sourceLabel}]\n${errorMessage}`);

  // 二重応答を避けつつ、安全にエラーメッセージを送信する
  try {
    // safeReplyを使用して安全に応答
    await safeReply(interaction, { content: userMsg, embeds: [], components: [], flags: MessageFlagsBitField.Flags.Ephemeral, ...opts });
  } catch (replyError) {
    const failMsg = `❌ エラー応答の送信に失敗しました (Interaction ID: ${interaction.id}) - ${replyError.message}`;
    console.error(failMsg);
    await logToFile(failMsg); // こちらもファイルに記録
  }
}

module.exports = { logAndReplyError };
