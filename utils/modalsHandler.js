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
 * モーダルインタラクションを�E琁E��めE * @param {import('discord.js').ModalSubmitInteraction} interaction
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
        content: '❁Eモーダルに対応する�E琁E��見つかりませんでした、E,
        ephemeral: true,
      });
    }

    await handler.handle(interaction);

  } catch (err) {
    await logAndReplyError(
      interaction,
      `❁Eモーダル処琁E��ラー: ${customId}\n${err?.stack || err}`,
      '❁Eモーダル処琁E��にエラーが発生しました、E,
      { ephemeral: true }
    );
  }
}

module.exports = { handleModal };
