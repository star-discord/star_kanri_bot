// utils/selectsHandler.js
const path = require('path');
const { loadHandlers } = require('./handlerLoader');
const { InteractionResponseFlags } = require('discord.js');

// 「totusuna_setti/selects」配下のセレクトメニュー用ハンドラー群を読み込み
const findHandler = loadHandlers(path.join(__dirname, 'totusuna_setti/selects'));

/**
 * セレクトメニューインタラクションの処理
 * @param {import('discord.js').StringSelectMenuInteraction} interaction
 */
async function handleSelect(interaction) {
  if (!interaction.isStringSelectMenu()) return;

  const customId = interaction.customId;
  const handler = findHandler(customId);

  if (!handler) {
    console.warn(`⚠️ 未対応のセレクトメニュー: ${customId}`);
    return await interaction.reply({
      content: '⚠️ このセレクトメニューは現在利用できません。',
      flags: InteractionResponseFlags.Ephemeral,
    });
  }

  try {
    await handler.handle(interaction);
  } catch (err) {
    console.error(`❌ セレクトメニュー処理エラー: ${customId}`, err);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: '❌ セレクトメニュー処理中にエラーが発生しました。',
        flags: InteractionResponseFlags.Ephemeral,
      });
    }
  }
}

module.exports = { handleSelect };
