// utils/errorHelper.js

const { MessageFlagsBitField } = require('discord.js');
const { safeReply } = require('./safeReply'); // 共通のsafeReplyをインポート
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
  // error.stack には通常 message も含まれるため、stackを優先する
  const details = error?.stack || message;
  const fullMessage = `[${timestamp}] [${source}]\n${details}`;

  console.error(fullMessage);
  await logErrorToFile(fullMessage);
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
  // logMsgがErrorインスタンスでない場合でも、new Error()でラップすることで、
  // 呼び出し元のスタックトレースをログに残すことができ、デバッグが容易になります。
  const error = logMsg instanceof Error ? logMsg : new Error(logMsg);

  await logError(`${source} [Guild:${guildId}] [User:${userId}]`, message, error);

  // ユーザーへの応答ペイロードを作成
  const replyPayload = {
    content: userMsg,
    flags: MessageFlagsBitField.Flags.Ephemeral,
    ...options,
  };

  // 共通化されたsafeReplyで応答
  await safeReply(interaction, replyPayload);
}

module.exports = {
  logError,
  logAndReplyError,
};
