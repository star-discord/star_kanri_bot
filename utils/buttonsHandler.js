// ファイル参照: utils/buttonsHandler.js

const path = require('path');
const { loadHandlers } = require('./handlerLoader');
const { InteractionResponseFlags } = require('discord.js');

// 各カテゴリのボタンハンドラを読み込み
const totusunaHandler = loadHandlers(path.join(__dirname, 'totusuna_setti/buttons'));
const kpiHandler = require('./kpi_setti/buttons.js'); // KPI中継ハンドラを追加

const fallbackHandlers = [
  totusunaHandler,
  kpiHandler,
];

/**
 * ボタンインタラクションの処理
 * @param {import('discord.js').ButtonInteraction} interaction
 */
async function handleButton(interaction) {
  if (!interaction.isButton()) return;

  const customId = interaction.customId;

  let handler = null;
  for (const find of fallbackHandlers) {
    handler = find(customId);
    if (handler) break;
  }

  if (!handler) {
    console.warn(`⚠️ 未対応のボタン: ${customId}`);
    return await interaction.reply({
      content: '⚠️ このボタンは現在利用できません。',
      flags: InteractionResponseFlags.Ephemeral,
    });
  }

  try {
    await handler.handle(interaction);
  } catch (err) {
    console.error(`❌ ボタン処理エラー: ${customId}`, err);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: '❌ ボタン処理中にエラーが発生しました。',
        flags: InteractionResponseFlags.Ephemeral,
      });
    }
  }
}

module.exports = { handleButton };
