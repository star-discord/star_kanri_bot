const { MessageFlags } = require('discord.js');
const tempState = require('../state/totsusunaTemp');

module.exports = {
  customId: 'totsusuna_setti:select_replicate_text',

  /**
   * 複製チャンネルの選択を処理
   * @param {import('discord.js').StringSelectMenuInteraction} interaction
   */
  async handle(interaction) {
    const guildId = interaction.guildId;
    const userId = interaction.user.id;
    const selected = interaction.values;

    if (!Array.isArray(selected) || selected.length === 0) {
      return await interaction.reply({
        content: '⚠️ 複製チャンネルが選択されていません。',
        flags: MessageFlags.Ephemeral,
      });
    }

    // 既存の一時データと統合
    const prev = tempState.get(guildId, userId) || {};
    tempState.set(guildId, userId, {
      ...prev,
      replicateChannelIds: selected,
    });

    await interaction.reply({
      content: `✅ 複製チャンネルとして ${selected.map(id => `<#${id}>`).join(', ')} を設定しました。`,
      flags: MessageFlags.Ephemeral,
    });
  },
};
