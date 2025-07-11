const path = require('path');
const { loadHandlers } = require('./handlerLoader');

const totusunaHandler = loadHandlers(path.join(__dirname, 'totusuna_setti/selects'));
const fallbackDirs = [
  'star_config/selects',
  'totusuna_config/selects',
  'totusuna_quick/selects'
].map(sub => loadHandlers(path.join(__dirname, sub)));

/**
 * セレクトメニューインタラクションを処理する
 * @param {import('discord.js').StringSelectMenuInteraction} interaction
 */
async function handleSelect(interaction) {
  if (!interaction.isStringSelectMenu()) return;

  const customId = interaction.customId;

  let handler = null;

  if (customId.startsWith('totusuna_')) {
    handler = totusunaHandler(customId);
  } else {
    for (const find of fallbackDirs) {
      handler = find(customId);
      if (handler) break;
    }
  }

  if (!handler) {
    return await interaction.reply({
      content: '❌ セレクトメニューに対応する処理が見つかりませんでした。',
      ephemeral: true
    });
  }

  try {
    await handler.handle(interaction);
  } catch (err) {
    console.error(`❌ セレクト処理エラー: ${customId}`, err);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: '❌ セレクト処理中にエラーが発生しました。',
        ephemeral: true
      });
    }
  }
}

module.exports = { handleSelect };

