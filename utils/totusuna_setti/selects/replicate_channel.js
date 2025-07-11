// utils/totusuna_setti/selects/replicate_channel.js

const tempStore = require('../../state/totsusunaTemp');
const { InteractionResponseFlags } = require('discord.js'); // ← 追加

module.exports = {
  customIdStart: 'totusuna_select_replicate:',

  /**
   * 複製チャンネル選択時の処理
   * @param {import('discord.js').StringSelectMenuInteraction} interaction
   */
  async handle(interaction) {
    const selected = interaction.values;
    const guildId = interaction.guildId;
    const userId = interaction.user.id;

    if (!selected || selected.length === 0) {
      return await interaction.reply({
        content: '⚠️ チャンネルが選択されていません。',
        flags: InteractionResponseFlags.Ephemeral,
      });
    }

    const current = tempStore.get(guildId, userId) || {};

    tempStore.set(guildId, userId, {
      ...current,
      replicateChannelIds: selected
    });

    const display = selected
      .map(id => {
        const ch = interaction.guild.channels.cache.get(id);
        return ch ? `<#${id}>（${ch.name}）` : `<#${id}>`;
      })
      .join(', ');

    await interaction.reply({
      content: `🌀 複製チャンネルを ${display} に設定しました。`,
      flags: InteractionResponseFlags.Ephemeral,
    });
  }
};
