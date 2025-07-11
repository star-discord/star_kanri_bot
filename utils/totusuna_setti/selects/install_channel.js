// utils/totusuna_setti/selects/install_channel.js

const tempStore = require('../../state/totsusunaTemp'); // 1つ上の階層のstateから読み込み

module.exports = {
  customIdStart: 'totusuna_select_main:',

  /**
   * 設置チャンネル選択時の処理
   * @param {import('discord.js').StringSelectMenuInteraction} interaction
   */
  async handle(interaction) {
    try {
      // 選択値が存在するか確認
      if (!interaction.values?.[0]) {
        return await interaction.reply({
          content: '⚠️ 選択されたチャンネルが見つかりませんでした。',
          ephemeral: true
        });
      }

      const selected = interaction.values[0];
      const guildId = interaction.guildId;
      const userId = interaction.user.id;

      // 現在の一時保存データを取得
      const current = tempStore.get(guildId, userId) || {};

      // 設置チャンネルIDを更新して保存
      tempStore.set(guildId, userId, {
        ...current,
        installChannelId: selected
      });

      // チャンネルがサーバーに存在するか確認（念のため）
      const channel = interaction.guild.channels.cache.get(selected);
      const channelName = channel ? channel.name : '指定チャンネル';

      // ユーザーに設定完了メッセージを送信
      await interaction.reply({
        content: `📌 設置チャンネルを <#${selected}>（${channelName}）に設定しました。`,
        ephemeral: true
      });

    } catch (error) {
      console.error('❌ 設置チャンネル選択処理でエラー発生:', error);

      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ 設置チャンネルの処理中にエラーが発生しました。管理者に連絡してください。',
          ephemeral: true
        });
      }
    }
  }
};
