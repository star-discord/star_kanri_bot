const { MessageFlagsBitField } = require('discord.js');
const tempState = require('../state/totusunaTemp'); // もし状態管理があれば読み込み

module.exports = {
  customId: 'totusuna_setti:select_main',

  /**
   * 投稿先メインチャンネル選択処理
   * @param {import('discord.js').StringSelectMenuInteraction} interaction
   */
  async handle(interaction) {
    try {
      const guildId = interaction.guildId;
      const userId = interaction.user.id;
      const selectedChannelId = interaction.values?.[0];

      if (!selectedChannelId) {
        await interaction.reply({
          content: '⚠️ チャンネルが選択されていません。もう一度お試しください。',
          flags: MessageFlagsBitField.Ephemeral,
        });
        return;
      }

      console.log(`[select_main] guildId=${guildId}, userId=${userId}, selectedChannelId=${selectedChannelId}`);

      // 一時状態に保存（既存のデータがあればマージ）
      const prevData = tempState.get(guildId, userId) || {};
      tempState.set(guildId, userId, {
        ...prevData,
        installChannelId: selectedChannelId,
      });

      // インタラクションはメッセージを編集せずに完了
      await interaction.deferUpdate();
    } catch (error) {
      console.error('[select_main] 処理中エラー:', error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ チャンネル選択処理でエラーが発生しました。管理者に連絡してください。',
          flags: MessageFlagsBitField.Ephemeral,
        });
      }
    }
  },
};

