const path = require('path');
const { loadHandlers } = require('./handlerLoader');

const totusunaHandler = loadHandlers(path.join(__dirname, 'totusuna_setti/modals'));
const fallbackDirs = [
  'star_config/modals',
  'totusuna_config/modals',
  'totusuna_quick/modals'
].map(sub => loadHandlers(path.join(__dirname, sub)));

/**
 * モーダルインタラクションを処理する
 * @param {import('discord.js').ModalSubmitInteraction} interaction
 */
async function handleModal(interaction) {
  if (!interaction.isModalSubmit()) return;

  const customId = interaction.customId;

  let handler = null;

  try {
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
        content: '❌ モーダルに対応する処理が見つかりませんでした。',
        ephemeral: true
      });
    }

    await handler.handle(interaction);

  } catch (err) {
    console.error(`❌ モーダル処理エラー: ${customId}`, err);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: '❌ モーダル処理中にエラーが発生しました。',
        ephemeral: true
      });
    }
  }
}

module.exports = { handleModal };
