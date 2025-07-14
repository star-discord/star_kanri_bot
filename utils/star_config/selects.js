// utils/star_config/selects.js
const path = require('path');
const { loadHandlers } = require('../handlerLoader'); // 汎用ハンドラ読み込み関数
const { MessageFlagsBitField } = require('discord.js');
const { logAndReplyError } = require('../errorHelper');

const handlers = loadHandlers(path.join(__dirname, 'selects'));

/**
 * STAR管理Bot設定用 selectメニューの dispatcher
 * @param {import('discord.js').AnySelectMenuInteraction} interaction
 */
module.exports = async function handleStarConfigSelect(interaction) {
  const handler = handlers(interaction.customId);

  if (!handler || typeof handler.handle !== 'function') {
    console.warn(`[star_config/selects] ハンドラが見つからないか無効: ${interaction.customId}`);
    await interaction.reply({
      content: '⚠️ 対応する設定処理が見つかりませんでした。',
      flags: MessageFlagsBitField.Flags.Ephemeral
    });
    return;
  }

  try {
    await handler.handle(interaction);
  } catch (err) {
    console.error(`[selects/${interaction.customId}] ハンドラー実行エラー:`, err);

    await logAndReplyError(
      interaction,
      `❌ STAR管理Bot設定エラー: ${interaction.customId}\n${err?.stack || err}`,
      '❌ 設定処理中にエラーが発生しました。',
      { flags: MessageFlagsBitField.Flags.Ephemeral }
    );
  }
};
