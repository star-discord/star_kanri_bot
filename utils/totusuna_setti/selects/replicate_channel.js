// utils/totusuna_setti/selects/replicate_channel.js

const tempStore = require('../state/totsusunaTemp');

module.exports = {
  customIdStart: 'totusuna_select_replicate:',

  /**
   * 複製チャンネル選択時の処理
   * @param {import('discord.js').SelectMenuInteraction} interaction
   */
  async handle(interaction) {
    const selected = interaction.values;
    const guildId = interaction.guildId;
    const userId = interaction.user.id;

    const current = tempStore.get(guildId, userId) || {};

    tempStore.set(guildId, userId, {
      ...current,
      replicateChannelIds: selected
    });

    await interaction.reply({
      content: `🌀 複製チャンネルを ${selected.map(id => `<#${id}>`).join(', ')} に設定しました。`,
      ephemeral: true
    });
  }
};
