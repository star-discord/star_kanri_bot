const { MessageFlagsBitField } = require('discord.js');
const fs = require('fs/promises');
const path = require('path');

const LOG_FILE = path.join(__dirname, '..', 'logs', 'error.log');

/**
 * ログファイルにエラーメッセージを出力
 * @param {string} message - フォーマット済みログ文字列
 */
async function logErrorToFile(message) {
  try {
    const logDir = path.dirname(LOG_FILE);
    await fs.mkdir(logDir, { recursive: true });
    await fs.appendFile(LOG_FILE, message + '\n\n', 'utf8');
  } catch (err) {
    console.error('[logErrorToFile] ログファイル書き込み失敗:', err);
  }
}

/**
 * エラー出力（コンソール + ファイル）
 * @param {string} source - 発生元
 * @param {string} message - 簡易エラー説明
 * @param {Error} [error] - 詳細情報を持つ Error オブジェクト
 */
async function logError(source, message, error) {
  const timestamp = new Date().toISOString();
  const stack = error?.stack || error?.message || '';
  const fullMessage = `[${timestamp}] [${source}]\n${message}${stack ? `\n${stack}` : ''}`;

  console.error(fullMessage);
  await logErrorToFile(fullMessage);
}

/**
 * 応答済み状態に応じて reply/followUp を安全に実行
 * @param {import('discord.js').Interaction} interaction
 * @param {string} content
 * @param {object} [options]
 */
async function safeReplyToUser(interaction, content, options = {}) {
  const replyPayload = {
    content,
    embeds: [],
    components: [],
    flags: MessageFlagsBitField.Flags.Ephemeral,
    ...options,
  };

  try {
    if (interaction.deferred || interaction.replied) {
      await interaction.followUp(replyPayload);
    } else {
      await interaction.reply(replyPayload);
    }
  } catch (err) {
    console.error('[safeReplyToUser] 応答失敗:', {
      error: err.message,
      interactionId: interaction.id,
      customId: interaction.customId ?? '(no customId)',
    });
  }
}

/**
 * エラーログ + ユーザーへの通知を一括で処理
 * @param {import('discord.js').Interaction} interaction
 * @param {string|Error} logMsg
 * @param {string} userMsg
 * @param {object} [options]
 */
async function logAndReplyError(interaction, logMsg, userMsg, options = {}) {
  const source = interaction.customId || interaction.commandName || 'unknown_interaction';
  const guildId = interaction.guildId || 'DM';
  const userId = interaction.user?.id || 'unknown_user';

  const message = logMsg instanceof Error ? logMsg.message : logMsg;
  const error = logMsg instanceof Error ? logMsg : undefined;

  await logError(`${source} [Guild:${guildId}] [User:${userId}]`, message, error);
  await safeReplyToUser(interaction, userMsg, options);
}

module.exports = {
  logError,
  safeReplyToUser,
  logAndReplyError,
};
