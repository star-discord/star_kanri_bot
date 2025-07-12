// utils/buttonsHandler.js
const path = require('path');
const { InteractionResponseFlags } = require('discord.js');
const { loadHandlers } = require('./handlerLoader.js');
const { logAndReplyError } = require('./errorHelper');

// 各カテゴリのbuttons.jsを読み込み（.js付きでパス指定）
const starConfigHandler = require(path.join(__dirname, 'star_config', 'buttons.js'));
const totusunaSettiHandler = loadHandlers(path.join(__dirname, 'totusuna_setti', 'buttons'));
const totusunaConfigHandler = loadHandlers(path.join(__dirname, 'totusuna_config', 'buttons'));
const kpiHandler = require(path.join(__dirname, 'kpi_setti', 'buttons.js'));

const fallbackHandlers = [
  starConfigHandler,
  totusunaSettiHandler,
  totusunaConfigHandler,
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
    await logAndReplyError(
      interaction,
      `❌ ボタン処理エラー: ${customId}\n${err?.stack || err}`,
      '❌ ボタン処理中にエラーが発生しました。',
      { flags: InteractionResponseFlags.Ephemeral }
    );
  }
}

module.exports = { handleButton };
