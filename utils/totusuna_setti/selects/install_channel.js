const { MessageFlags } = require('discord.js');
const findHandler = require('../selects');

/**
 * 繧ｻ繝ｬ繧ｯ繝医Γ繝九Η繝ｼ繧､繝ｳ繧ｿ繝ｩ繧ｯ繧ｷ繝ｧ繝ｳ繧貞・逅・☆繧九Γ繧､繝ｳ髢｢謨ｰ
 * @param {import('discord.js').StringSelectMenuInteraction} interaction
 */
async function handleSelect(interaction) {
  if (!interaction.isStringSelectMenu()) return;

  const customId = interaction.customId;
  const handler = findHandler(customId);

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

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: '笞・・繧ｻ繝ｬ繧ｯ繝医Γ繝九Η繝ｼ蜃ｦ逅・ｸｭ縺ｫ繧ｨ繝ｩ繝ｼ縺檎匱逕溘＠縺ｾ縺励◆縲らｮ｡逅・・↓蝣ｱ蜻翫＠縺ｦ縺上□縺輔＞縲・,
        flags: MessageFlags.Ephemeral,
      });
    } else {
      await interaction.reply({
        content: '笞・・繧ｻ繝ｬ繧ｯ繝医Γ繝九Η繝ｼ蜃ｦ逅・ｸｭ縺ｫ繧ｨ繝ｩ繝ｼ縺檎匱逕溘＠縺ｾ縺励◆縲らｮ｡逅・・↓蝣ｱ蜻翫＠縺ｦ縺上□縺輔＞縲・,
        flags: MessageFlags.Ephemeral,
      });
    }
  }
}

module.exports = { handleSelect };


