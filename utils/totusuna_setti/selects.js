// utils/totusuna_setti/selects.js
const { MessageFlags } = require('discord.js');
const path = require('path');
const { loadHandlers } = require('../handlerLoader');

// totusuna_setti蟆ら畑縺ｮ繝上Φ繝峨Λ繧定ｪｭ縺ｿ霎ｼ縺ｿ
const totusunaHandlers = loadHandlers(path.join(__dirname, 'selects'));

/**
 * 繧ｻ繝ｬ繧ｯ繝医Γ繝九Η繝ｼ繧､繝ｳ繧ｿ繝ｩ繧ｯ繧ｷ繝ｧ繝ｳ繧貞・逅・☆繧九Γ繧､繝ｳ髢｢謨ｰ
 * @param {import('discord.js').StringSelectMenuInteraction} interaction
 */
async function handleSelect(interaction) {
  if (!interaction.isStringSelectMenu()) return;

  const customId = interaction.customId;
  let handler;

  // totusuna髢｢騾｣縺ｮ繝上Φ繝峨Λ繧呈爾縺・  handler = totusunaHandlers(customId);

  if (!handler) {
    await interaction.reply({
      content: '笶・繧ｻ繝ｬ繧ｯ繝医Γ繝九Η繝ｼ縺ｫ蟇ｾ蠢懊☆繧句・逅・′隕九▽縺九ｊ縺ｾ縺帙ｓ縺ｧ縺励◆縲・,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  try {
    await handler.handle(interaction);
  } catch (error) {
    console.error(`笶・繧ｻ繝ｬ繧ｯ繝医Γ繝九Η繝ｼ蜃ｦ逅・お繝ｩ繝ｼ (${customId}):`, error);

    const errorMessage = {
      content: '笞・・繧ｻ繝ｬ繧ｯ繝医Γ繝九Η繝ｼ蜃ｦ逅・ｸｭ縺ｫ繧ｨ繝ｩ繝ｼ縺檎匱逕溘＠縺ｾ縺励◆縲らｮ｡逅・・↓蝣ｱ蜻翫＠縺ｦ縺上□縺輔＞縲・,
      flags: MessageFlags.Ephemeral,
    };

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(errorMessage);
    } else {
      await interaction.reply(errorMessage);
    }
  }
}

module.exports = { handleSelect };
