
const path = require('path');
const { loadHandlers } = require('../../handlerLoader');

// 縲荊otusuna_setti縲埼・荳九・繧ｻ繝ｬ繧ｯ繝医Γ繝九Η繝ｼ逕ｨ繝上Φ繝峨Λ繝ｼ鄒､繧定ｪｭ縺ｿ霎ｼ縺ｿ
const totusunaHandler = loadHandlers(path.join(__dirname, '../../totusuna_setti/selects'));

// 縺昴・莉悶・繧ｻ繝ｬ繧ｯ繝医Γ繝九Η繝ｼ逕ｨ繝上Φ繝峨Λ繝ｼ鄒､・亥ｾ梧婿莠呈鋤縺ｪ縺ｩ・・const fallbackDirs = [
  'star_config/selects',
  'totusuna_config/selects'
].map(sub => loadHandlers(path.join(__dirname, '../../', sub)));

/**
 * 繧ｻ繝ｬ繧ｯ繝医Γ繝九Η繝ｼ繧､繝ｳ繧ｿ繝ｩ繧ｯ繧ｷ繝ｧ繝ｳ繧貞・逅・☆繧九Γ繧､繝ｳ髢｢謨ｰ
 * @param {import('discord.js').StringSelectMenuInteraction} interaction
 */
async function handleSelect(interaction) {
  // 繧ｻ繝ｬ繧ｯ繝医Γ繝九Η繝ｼ莉･螟悶・繧､繝ｳ繧ｿ繝ｩ繧ｯ繧ｷ繝ｧ繝ｳ縺ｯ辟｡隕・  if (!interaction.isStringSelectMenu()) return;

  const customId = interaction.customId;
  let handler = null;

  try {
    // 縲荊otusuna_縲阪〒蟋九∪繧・customId 繧貞━蜈育噪縺ｫ蜃ｦ逅・    if (customId.startsWith('totusuna_')) {
      handler = totusunaHandler(customId);
    } else {
      // 繝輔か繝ｼ繝ｫ繝舌ャ繧ｯ逕ｨ繝・ぅ繝ｬ繧ｯ繝医Μ鄒､縺九ｉ蟇ｾ蠢懊☆繧九ワ繝ｳ繝峨Λ繧帝・↓謗｢邏｢
      for (const find of fallbackDirs) {
        handler = find(customId);
        if (handler) break;
      }
    }

    if (!handler) {
      // 蟇ｾ蠢懊ワ繝ｳ繝峨Λ縺ｪ縺励ゅΘ繝ｼ繧ｶ繝ｼ縺ｸ騾夂衍
      await interaction.reply({
        content: ':x: 繧ｻ繝ｬ繧ｯ繝医Γ繝九Η繝ｼ縺ｫ蟇ｾ蠢懊☆繧句・逅・′隕九▽縺九ｊ縺ｾ縺帙ｓ縺ｧ縺励◆縲・,
        ephemeral: true,
      });
      return;
    }

    // 繝上Φ繝峨Λ縺ｮ蜃ｦ逅・ｒ螳溯｡・    await handler.handle(interaction);

  } catch (error) {
    // 萓句､也匱逕滓凾縺ｮ繝ｭ繧ｰ蜃ｺ蜉・    console.error(`笶・繧ｻ繝ｬ繧ｯ繝医Γ繝九Η繝ｼ蜃ｦ逅・ｸｭ縺ｫ繧ｨ繝ｩ繝ｼ逋ｺ逕・(customId: ${customId}):`, error);

    // 縺吶〒縺ｫ霑比ｿ｡貂医∩ or defer貂医∩縺ｪ繧・followUp縲√◎繧御ｻ･螟悶・ reply 縺ｧ繧ｨ繝ｩ繝ｼ繝｡繝・そ繝ｼ繧ｸ騾∽ｿ｡
    if (interaction.replied || interaction.deferred) {
      try {
        await interaction.followUp({
          content: ':warning: 繧ｻ繝ｬ繧ｯ繝医Γ繝九Η繝ｼ蜃ｦ逅・ｸｭ縺ｫ繧ｨ繝ｩ繝ｼ縺檎匱逕溘＠縺ｾ縺励◆縲らｮ｡逅・・↓蝣ｱ蜻翫＠縺ｦ縺上□縺輔＞縲・,
          ephemeral: true,
        });
      } catch (followUpError) {
        console.error(':x: 繝輔か繝ｭ繝ｼ繧｢繝・・騾∽ｿ｡荳ｭ縺ｫ繧ｨ繝ｩ繝ｼ:', followUpError);
      }
    } else {
      try {
        await interaction.reply({
          content: ':warning: 繧ｻ繝ｬ繧ｯ繝医Γ繝九Η繝ｼ蜃ｦ逅・ｸｭ縺ｫ繧ｨ繝ｩ繝ｼ縺檎匱逕溘＠縺ｾ縺励◆縲らｮ｡逅・・↓蝣ｱ蜻翫＠縺ｦ縺上□縺輔＞縲・,
          ephemeral: true,
        });
      } catch (replyError) {
        console.error(':x: 繝ｪ繝励Λ繧､騾∽ｿ｡荳ｭ縺ｫ繧ｨ繝ｩ繝ｼ:', replyError);
      }
    }
  }
}

module.exports = { handleSelect };
