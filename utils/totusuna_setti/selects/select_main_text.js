const { MessageFlagsBitField } = require('discord.js');
const tempState = require('../state/totusunaTemp');

module.exports = {
  customId: 'totusuna_setti:select_main_text', // 「totusuna」表記に統一（もし他がtotusunaなら）

  /**
   * 投稿先チャンネルの選択処理
   * @param {import('discord.js').StringSelectMenuInteraction} interaction
   */
  async handle(interaction) {
    try {
      const guildId = interaction.guildId;
      const userId = interaction.user.id;

      const selectedChannelId = interaction.values?.[0];
      if (!selectedChannelId) {
        await interaction.reply({
          content: '⚠️ チャンネルが正しく選択されていません。再度選択してください。',
          flags: MessageFlagsBitField.Ephemeral,
        });
        return;
      }

      // 既存データ取得しつつ上書き保存
      const prev = tempState.get(guildId, userId) || {};
      tempState.set(guildId, userId, {
        ...prev,
        installChannelId: selectedChannelId,
      });

      await interaction.reply({
        content: `✅ チャンネル <#${selectedChannelId}> が選択されました。`,
        flags: MessageFlagsBitField.Ephemeral,
      });

      console.log(`[select_main_text] guildId=${guildId}, userId=${userId}, selectedChannel=${selectedChannelId}`);
    } catch (error) {
      console.error('[select_main_text] エラー:', error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ チャンネル選択処理中にエラーが発生しました。管理者に連絡してください。',
          flags: MessageFlagsBitField.Ephemeral,
        });
      }
    }
  },
};
