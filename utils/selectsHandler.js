// commands/common/selectHandler.js
const starSelectHandler = require('../utils/star_config/selects');
const totsusunaSelectHandler = require('../utils/totusuna_setti/selects');
const { MessageFlags } = require('discord.js');
const { logAndReplyError } = require('./errorHelper');

/**
 * @param {import('discord.js').StringSelectMenuInteraction} interaction
 */
async function handleSelect(interaction) {
  if (!interaction.isStringSelectMenu()) return;

  const { customId } = interaction;

  let handler = null;

  // 繝励Ξ繝輔ぅ繝・け繧ｹ莉倥″縺ｮcustomId繧貞・逅・  if (customId.startsWith('star_config:')) {
    handler = starSelectHandler(customId);
  } else if (customId.startsWith('totsusuna_setti:')) {
    handler = totsusunaSelectHandler(customId);
  } 
  // STAR險ｭ螳夐未騾｣縺ｮ繝励Ξ繝輔ぅ繝・け繧ｹ縺ｪ縺幼ustomId繧貞・逅・  else if (customId === 'admin_role_select' || customId === 'notify_channel_select') {
    await starSelectHandler(interaction);
    return;
  }
  // totusuna_setti髢｢騾｣縺ｮ繝励Ξ繝輔ぅ繝・け繧ｹ縺ｪ縺幼ustomId繧貞・逅・  else if (customId === 'totusuna_select_main' || customId === 'totusuna_select_replicate' || customId === 'totusuna_config_select') {
    await totsusunaSelectHandler(interaction);
    return;
  }
  // 縺昴・莉悶・繝励Ξ繝輔ぅ繝・け繧ｹ縺ｪ縺幼ustomId縺ｮ蜃ｦ逅・  else {
    // 莉悶・繝上Φ繝峨Λ繝ｼ縺後≠繧後・霑ｽ蜉
    handler = null;
  }

  if (!handler) {
    return await interaction.reply({
      content: '笶・繧ｻ繝ｬ繧ｯ繝医Γ繝九Η繝ｼ縺ｫ蟇ｾ蠢懊☆繧句・逅・′隕九▽縺九ｊ縺ｾ縺帙ｓ縺ｧ縺励◆縲・,
      flags: MessageFlags.Ephemeral,
    });
  }

  try {
    await handler.handle(interaction);
  } catch (err) {
    await logAndReplyError(
      interaction,
      `笶・繧ｻ繝ｬ繧ｯ繝医お繝ｩ繝ｼ (${customId})\n${err?.stack || err}`,
      '笶・繧ｨ繝ｩ繝ｼ縺檎匱逕溘＠縺ｾ縺励◆縲・,
      { flags: MessageFlags.Ephemeral }
    );
  }
}

module.exports = { handleSelect };
