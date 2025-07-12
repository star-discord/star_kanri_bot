// utils/buttonsHandler.js
const path = require('path');
const { MessageFlags } = require('discord.js');
const { loadHandlers } = require('./handlerLoader.js');
const { logAndReplyError } = require('./errorHelper');

// 蜷・き繝・ざ繝ｪ縺ｮbuttons.js繧定ｪｭ縺ｿ霎ｼ縺ｿ・・js莉倥″縺ｧ繝代せ謖・ｮ夲ｼ・const starConfigHandler = require(path.join(__dirname, 'star_config', 'buttons.js'));
const starChatGptSettiHandler = require(path.join(__dirname, 'star_chat_gpt_setti', 'buttons.js'));
const totusunaSettiHandler = loadHandlers(path.join(__dirname, 'totusuna_setti', 'buttons'));
const totusunaConfigHandler = loadHandlers(path.join(__dirname, 'totusuna_config', 'buttons'));
const kpiHandler = require(path.join(__dirname, 'kpi_setti', 'buttons.js'));

const fallbackHandlers = [
  starConfigHandler,
  starChatGptSettiHandler,
  totusunaSettiHandler,
  totusunaConfigHandler,
  kpiHandler,
];

/**
 * 繝懊ち繝ｳ繧､繝ｳ繧ｿ繝ｩ繧ｯ繧ｷ繝ｧ繝ｳ縺ｮ蜃ｦ逅・ * @param {import('discord.js').ButtonInteraction} interaction
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
    console.warn(`笞・・譛ｪ蟇ｾ蠢懊・繝懊ち繝ｳ: ${customId}`);
    return await interaction.reply({
      content: '笞・・縺薙・繝懊ち繝ｳ縺ｯ迴ｾ蝨ｨ蛻ｩ逕ｨ縺ｧ縺阪∪縺帙ｓ縲・,
      flags: MessageFlags.Ephemeral,
    });
  }

  try {
    await handler.handle(interaction);
  } catch (err) {
    await logAndReplyError(
      interaction,
      `笶・繝懊ち繝ｳ蜃ｦ逅・お繝ｩ繝ｼ: ${customId}\n${err?.stack || err}`,
      '笶・繝懊ち繝ｳ蜃ｦ逅・ｸｭ縺ｫ繧ｨ繝ｩ繝ｼ縺檎匱逕溘＠縺ｾ縺励◆縲・,
      { flags: MessageFlags.Ephemeral }
    );
  }
}

module.exports = { handleButton };
