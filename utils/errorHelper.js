// utils/errorHelper.js
const { MessageFlagsBitField } = require('discord.js');
const fs = require('fs/promises');
const path = require('path');

/**
 * エラーログを出力（コンソール + ファイル）
 * @param {string} source - エラー発生源識別子
 * @param {string} message - エラーメッセージ
 * @param {Error} [error] - スタック情報を含む Error オブジェクト（省略可能）
 */
async function logError(source, message, error) {
  const timestamp = new Date().toISOString();
  const stack = error?.stack || error?.message || '';
  const fullMessage = `[${timestamp}] [${source}] ${message}${stack ? `\n${stack}` : ''}`;

  console.error(fullMessage); // コンソール出力

  try {
    const logDir = path.join(__dirname, '..', 'logs');
    await fs.mkdir(logDir, { recursive: true });
    const logPath = path.join(logDir, 'error.log');
    await fs.appendFile(logPath, `${fullMessage}\n`, 'utf8');
  } catch (fileError) {
    console.error('[logError] ログファイルへの書き込みに失敗:', fileError);
  }
}

/**
 * 応答済みかどうかを判断してユーザーに安全にエラーメッセージを返す
 * @param {import('discord.js').Interaction} interaction
 * @param {string} content - メッセージ内容
 * @param {object} [options] - flags, embeds, components など
 */
async function safeReplyToUser(interaction, content, options = {}) {
  const replyOptions = {
    content,
    embeds: [],
    components: [],
    flags: MessageFlagsBitField.Flags.Ephemeral,
    ...options,
  };

  try {
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(replyOptions);
    } else {
      await interaction.reply(replyOptions);
    }
  } catch (err) {
    console.error('[safeReplyToUser] 応答失敗:', err.message, {
      interactionId: interaction.id,
      customId: interaction.customId,
    });
  }
}

/**
 * ログ記録とユーザーへの通知をまとめて行う
 * @param {import('discord.js').Interaction} interaction
 * @param {string|Error} logMsg - エラーメッセージか Error オブジェクト
 * @param {string} userMsg - ユーザーへの表示内容
 * @param {object} [options] - embeds や flags などの応答オプション
 */
async function logAndReplyError(interaction, logMsg, userMsg, options = {}) {
  const source = interaction.customId || interaction.commandName || 'unknown_interaction';
  const guildId = interaction.guildId || 'DM';
  const userId = interaction.user?.id || 'unknown_user';

  const logMessage = logMsg instanceof Error ? logMsg.message : logMsg;
  const errorObject = logMsg instanceof Error ? logMsg : undefined;

  await logError(`${source} [Guild:${guildId}] [User:${userId}]`, logMessage, errorObject);
  await safeReplyToUser(interaction, userMsg, options);
}

module.exports = {
  logError,
  safeReplyToUser,
  logAndReplyError,
};
