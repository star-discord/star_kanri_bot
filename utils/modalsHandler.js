const path = require('path');
const { loadHandlers } = require('./handlerLoader');
const { logAndReplyError } = require('./errorHelper');

const totusunaHandler = loadHandlers(path.join(__dirname, 'totusuna_setti/modals'));
const starChatGptSettiHandler = require(path.join(__dirname, 'star_chat_gpt_setti', 'modals.js'));
const fallbackHandlers = [
  loadHandlers(path.join(__dirname, 'star_config/modals')),
  starChatGptSettiHandler,
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
    if (customId.startsWith('totsusuna_') || customId.startsWith('totusuna_')) {
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
        flags: MessageFlags.Ephemeral,
      });
    }

    await handler.handle(interaction);

  } catch (err) {
    await logAndReplyError(
      interaction,
      `❌ モーダル処理エラー: ${customId}\n${err?.stack || err}`,
      '❌ モーダル処理中にエラーが発生しました。',
      { flags: MessageFlags.Ephemeral }
    );
  }
}

module.exports = { handleModal };
