// utils/totusuna_setti/selects/install_channel.js

const tempStore = require('../../state/totsusunaTemp');
const { InteractionResponseFlags } = require('discord.js'); // ← 追加

module.exports = {
  customIdStart: 'totusuna_select_main:',

  /**
   * 設置チャンネル選択時の処理
   * @param {import('discord.js').StringSelectMenuInteraction} interaction
   */
  async handle(interaction) {
    try {
      if (!interaction.values?.[0]) {
        return await interaction.reply({
          content: '⚠️ 選択されたチャンネルが見つかりませんでした。',
          flags: InteractionResponseFlags.Ephemeral,
        });
      }

      const selected = interaction.values[0];
      const guildId = interaction.guildId;
      const userId = interaction.user.id;

      const current = tempStore.get(guildId, userId) || {};
      tempStore.set(guildId, userId, {
        ...current,
        installChannelId: selected
      });

      const channel = interaction.guild.channels.cache.get(selected);
      const channelName = channel ? channel.name : '指定チャンネル';

      await interaction.reply({
        content: `📌 設置チャンネルを <#${selected}>（${channelName}）に設定しました。`,
        flags: InteractionResponseFlags.Ephemeral,
      });

    } catch (error) {
      console.error('❌ 設置チャンネル選択処理でエラー発生:', error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ 設置チャンネルの処理中にエラーが発生しました。管理者に連絡してください。',
          flags: InteractionResponseFlags.Ephemeral,
        });
      }
    }
  }
};
