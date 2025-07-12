const { MessageFlags } = require('discord.js');
const tempState = require('../state/totsusunaTemp');

module.exports = {
  customId: 'totsusuna_setti:select_replicate_text',

  /**
   * 褁E��チャンネルの選択を処琁E   * @param {import('discord.js').StringSelectMenuInteraction} interaction
   */
  async handle(interaction) {
    const guildId = interaction.guildId;
    const userId = interaction.user.id;
    const selected = interaction.values;

    if (!Array.isArray(selected) || selected.length === 0) {
      return await interaction.reply({
        content: '⚠�E�E褁E��チャンネルが選択されてぁE��せん、E,
        flags: MessageFlags.Ephemeral,
      });
    }

    // 既存�E一時データと統吁E    const prev = tempState.get(guildId, userId) || {};
    tempState.set(guildId, userId, {
      ...prev,
      replicateChannelIds: selected,
    });

    await interaction.reply({
      content: `✁E褁E��チャンネルとして ${selected.map(id => `<#${id}>`).join(', ')} を設定しました。`,
      flags: MessageFlags.Ephemeral,
    });
  },
};
