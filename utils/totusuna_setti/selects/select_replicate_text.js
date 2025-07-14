const { MessageFlagsBitField } = require('discord.js'); // MessageFlagsBitField が正しいです
const tempState = require('../state/totusunaTemp');

module.exports = {
  customId: 'totusuna_setti:select_replicate_text',

  /**
   * 複製チャンネルの選択を処理
   * @param {import('discord.js').StringSelectMenuInteraction} interaction
   */
  async handle(interaction) {
    try {
      const guildId = interaction.guildId;
      const userId = interaction.user.id;
      const selected = interaction.values;

      if (!Array.isArray(selected) || selected.length === 0) {
        return await interaction.reply({
          content: '⚠️ 複製チャンネルが選択されていません。',
          flags: MessageFlagsBitField.Ephemeral,
        });
      }

      // 既存の一時データとマージして保存
      const prev = tempState.get(guildId, userId) || {};
      tempState.set(guildId, userId, {
        ...prev,
        replicateChannelIds: selected,
      });

      await interaction.reply({
        content: `✅ 複製チャンネルとして ${selected.map(id => `<#${id}>`).join(', ')} を設定しました。`,
        flags: MessageFlagsBitField.Ephemeral,
      });
    } catch (error) {
      console.error('[select_replicate_text] 処理エラー:', error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ 複製チャンネル設定中にエラーが発生しました。',
          flags: MessageFlagsBitField.Ephemeral,
        });
      }
    }
  },
};

