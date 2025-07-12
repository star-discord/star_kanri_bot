const { MessageFlags } = require('discord.js');
const tempState = require('../state/totsusunaTemp');

module.exports = {
  customId: 'totsusuna_setti:select_replicate_text',

  /**
   * 隍・｣ｽ繝√Ε繝ｳ繝阪Ν縺ｮ驕ｸ謚槭ｒ蜃ｦ逅・   * @param {import('discord.js').StringSelectMenuInteraction} interaction
   */
  async handle(interaction) {
    const guildId = interaction.guildId;
    const userId = interaction.user.id;
    const selected = interaction.values;

    if (!Array.isArray(selected) || selected.length === 0) {
      return await interaction.reply({
        content: '笞・・隍・｣ｽ繝√Ε繝ｳ繝阪Ν縺碁∈謚槭＆繧後※縺・∪縺帙ｓ縲・,
        flags: MessageFlags.Ephemeral,
      });
    }

    // 譌｢蟄倥・荳譎ゅョ繝ｼ繧ｿ縺ｨ邨ｱ蜷・    const prev = tempState.get(guildId, userId) || {};
    tempState.set(guildId, userId, {
      ...prev,
      replicateChannelIds: selected,
    });

    await interaction.reply({
      content: `笨・隍・｣ｽ繝√Ε繝ｳ繝阪Ν縺ｨ縺励※ ${selected.map(id => `<#${id}>`).join(', ')} 繧定ｨｭ螳壹＠縺ｾ縺励◆縲Ａ,
      flags: MessageFlags.Ephemeral,
    });
  },
};
