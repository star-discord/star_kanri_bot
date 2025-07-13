// utils/star_config/selects.js
const path = require('path');
const { loadHandlers } = require('../handlerLoader'); // 汎用ハンドラ読み込み関数
const handlers = loadHandlers(path.join(__dirname, 'selects'));

/**
 * STAR管理Bot設定用 selectメニューの dispatcher
 * @param {import('discord.js').AnySelectMenuInteraction} interaction
 */
module.exports = async function handleStarConfigSelect(interaction) {
  const handler = handlers(interaction.customId);
  if (!handler) return;

  try {
    await handler.handle(interaction);
  } catch (err) {
    console.error(`[selects/${interaction.customId}] ハンドラー実行エラー:`, err);
    await interaction.reply({
      content: 'エラー: 設定処理でエラーが発生しました。',
      ephemeral: true
    });
  }
};
