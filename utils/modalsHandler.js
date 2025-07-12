const path = require('path');
const { loadHandlers } = require('./handlerLoader');
const { logAndReplyError } = require('./errorHelper');

const totusunaHandler = loadHandlers(path.join(__dirname, 'totusuna_setti/modals'));
const fallbackHandlers = [
  loadHandlers(path.join(__dirname, 'star_config/modals')),
  loadHandlers(path.join(__dirname, 'totusuna_config/modals')),
];

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
      for (const find of fallbackHandlers) {
        handler = find(customId);
        if (handler) break;
      }
    }

    if (!handler) {
      return await interaction.reply({
        content: '❌ モーダルに対応する処理が見つかりませんでした。',
        ephemeral: true,
      });
    }

    await handler.handle(interaction);

  } catch (err) {
    await logAndReplyError(
      interaction,
      `❌ モーダル処理エラー: ${customId}\n${err?.stack || err}`,
      '❌ モーダル処理中にエラーが発生しました。',
      { ephemeral: true }
    );
  }
}

module.exports = { handleModal };
