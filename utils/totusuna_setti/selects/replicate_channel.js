// utils/totusuna_setti/selects/replicate_channel.js
const { MessageFlagsBitField } = require('discord.js');
const tempState = require('../state/totusunaTemp');

module.exports = {
  customId: 'totusuna_setti:select_replicate',

  /**
   * @param {import('discord.js').StringSelectMenuInteraction} interaction
   */
  async handle(interaction) {
    try {
      // 型チェック（必要なら）
      if (!interaction.isStringSelectMenu()) return;

      const guildId = interaction.guildId;
      const userId = interaction.user.id;
      const selectedChannelIds = interaction.values;

      console.log(`[select_replicate] guildId=${guildId}, userId=${userId}, selectedChannels=${selectedChannelIds}`);

      if (!selectedChannelIds || selectedChannelIds.length === 0) {
        await interaction.reply({
          content: '⚠️ チャンネルが選択されていません。もう一度選択してください。',
          flags: MessageFlagsBitField.Ephemeral,
        });
        return;
      }

      // 一時状態更新
      const state = tempState.get(guildId, userId) || {};
      state.replicateChannelIds = selectedChannelIds;
      tempState.set(guildId, userId, state);

      await interaction.reply({
        content: `🌀 複製投稿チャンネルを設定しました: ${selectedChannelIds.map(id => `<#${id}>`).join(', ')}`,
        flags: MessageFlagsBitField.Ephemeral,
      });
    } catch (error) {
      console.error('[select_replicate] エラー:', error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ 処理中にエラーが発生しました。管理者に連絡してください。',
          flags: MessageFlagsBitField.Ephemeral,
        });
      }
    }
  }
};
