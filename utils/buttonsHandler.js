// utils/buttonsHandler.js
const path = require('path');
const { MessageFlagsBitField } = require('discord.js');
const { loadHandlers } = require('./handlerLoader.js');
const { logAndReplyError } = require('./errorHelper');

/**
 * 指定されたモジュールから findHandler 関数を取得（存在しなければnull返す）
 * @param {string} modulePath
 * @returns {(customId: string) => object|null}
 */
function getFindHandler(modulePath) {
  try {
    const mod = require(modulePath);
    if (typeof mod.findHandler === 'function') {
      return mod.findHandler;
    }
    console.warn(`[buttonsHandler] ${modulePath} に findHandler がありません。スキップします。`);
  } catch (err) {
    console.warn(`[buttonsHandler] ${modulePath} の読み込み失敗:`, err);
  }
  return null;
}

// 各ハンドラモジュールの findHandler 関数を取得
const starConfigHandler = getFindHandler(path.join(__dirname, 'star_config', 'buttons.js'));
const starChatGptSettiHandler = getFindHandler(path.join(__dirname, 'star_chat_gpt_setti', 'buttons.js'));
const totusunaSettiHandler = loadHandlers(path.join(__dirname, 'totusuna_setti', 'buttons'));
const totusunaConfigHandler = loadHandlers(path.join(__dirname, 'totusuna_config', 'buttons'));
const kpiHandler = getFindHandler(path.join(__dirname, 'kpi_setti', 'buttons.js'));
const attendanceHandler = getFindHandler(path.join(__dirname, 'attendance', 'buttons.js'));

// null除去して配列作成
const fallbackHandlers = [
  starConfigHandler,
  starChatGptSettiHandler,
  totusunaSettiHandler,
  totusunaConfigHandler,
  kpiHandler,
  attendanceHandler,
].filter(Boolean);

/**
 * ボタンインタラクションの処理
 * @param {import('discord.js').ButtonInteraction} interaction
 */
async function handleButton(interaction) {
  if (!interaction.isButton()) return;

  const customId = interaction.customId;

  if (!customId || typeof customId !== 'string') {
    console.warn('[buttonsHandler] 無効なcustomId:', customId);
    return await interaction.reply({
      content: '⚠️ 不正なボタンが押されました。',
      flags: MessageFlagsBitField.Ephemeral,
    });
  }

  let handler = null;
  for (const findHandler of fallbackHandlers) {
    try {
      handler = findHandler(customId);
      if (handler) break;
    } catch (err) {
      console.error(`[buttonsHandler] findHandler 実行時エラー: ${customId}`, err);
    }
  }

  if (!handler) {
    console.warn(`[buttonsHandler] 未対応のボタン: ${customId}`);
    return await interaction.reply({
      content: '⚠️ このボタンは現在利用できません。',
      flags: MessageFlagsBitField.Ephemeral,
    });
  }

  try {
    await handler.handle(interaction);
  } catch (err) {
    console.error(`[buttonsHandler] ボタン処理エラー: ${customId}`, err);
    await logAndReplyError(
      interaction,
      `❌ ボタン処理エラー: ${customId}\n${err?.stack || err}`,
      '❌ ボタン処理中にエラーが発生しました。',
      { flags: MessageFlagsBitField.Ephemeral }
    );
  }
}

module.exports = { handleButton };
