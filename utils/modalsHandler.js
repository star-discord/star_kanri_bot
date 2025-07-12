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
 * 繝｢繝ｼ繝繝ｫ繧､繝ｳ繧ｿ繝ｩ繧ｯ繧ｷ繝ｧ繝ｳ繧貞・逅・☆繧・ * @param {import('discord.js').ModalSubmitInteraction} interaction
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
        content: '笶・繝｢繝ｼ繝繝ｫ縺ｫ蟇ｾ蠢懊☆繧句・逅・′隕九▽縺九ｊ縺ｾ縺帙ｓ縺ｧ縺励◆縲・,
        ephemeral: true,
      });
    }

    await handler.handle(interaction);

  } catch (err) {
    await logAndReplyError(
      interaction,
      `笶・繝｢繝ｼ繝繝ｫ蜃ｦ逅・お繝ｩ繝ｼ: ${customId}\n${err?.stack || err}`,
      '笶・繝｢繝ｼ繝繝ｫ蜃ｦ逅・ｸｭ縺ｫ繧ｨ繝ｩ繝ｼ縺檎匱逕溘＠縺ｾ縺励◆縲・,
      { ephemeral: true }
    );
  }
}

module.exports = { handleModal };
