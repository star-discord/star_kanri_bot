// utils/totusuna_setti/selects/select_main.js

const { MessageFlagsBitField } = require('discord.js');
const { checkAdmin } = require('../../permissions/checkAdmin');
const tempState = require('../state/totusunaTemp');

module.exports = {
  customId: 'totusuna_setti:select_main',

  /**
   * 凸スナの投稿先メインチャンネルを一時状態に保存します。
   * @param {import('discord.js').StringSelectMenuInteraction} interaction
   */
  async handle(interaction) {
    try {
      // Defer immediately to prevent timeouts
      await interaction.deferReply({ flags: MessageFlagsBitField.Flags.Ephemeral });

      // Then, check for admin permissions
      const isAdmin = await checkAdmin(interaction);
      if (!isAdmin) {
        return await interaction.editReply({ content: '❌ この操作には管理者権限が必要です。' });
      }

      const guildId = interaction.guildId;
      const userId = interaction.user.id;
      const selectedChannelId = interaction.values?.[0];

      if (!selectedChannelId) {
        return await interaction.editReply({
          content: '⚠️ チャンネルが選択されていません。もう一度お試しください。',
        });
      }

      // 一時状態に保存（既存のデータがあればマージ）
      const prevData = tempState.get(guildId, userId) || {};
      tempState.set(guildId, userId, {
        ...prevData,
        installChannelId: selectedChannelId,
      });

      await interaction.editReply({
        content: `✅ メインチャンネルとして <#${selectedChannelId}> を選択しました。`,
      });

    } catch (error) {
      console.error(`[select_main] 処理中エラー: guild=${interaction.guildId}, user=${interaction.user.id}`, error);
      if (interaction.deferred) {
        await interaction.editReply({ content: '❌ チャンネル設定中にエラーが発生しました。' });
      }
    }
  },
};
