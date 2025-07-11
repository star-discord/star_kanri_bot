// utils/totusuna_setti/selects/install_channel.js

const tempStore = require('../../state/totsusunaTemp'); // ✅ パス修正（1つ上の階層）

module.exports = {
  customIdStart: 'totusuna_select_main:',

  /**
   * 設置チャンネル選択時の処理
   * @param {import('discord.js').StringSelectMenuInteraction} interaction
   */
  async handle(interaction) {
    // ✅ safety: 値が存在するかをチェック
    if (!interaction.values?.[0]) {
      return await interaction.reply({
        content: '⚠️ 選択されたチャンネルが見つかりませんでした。',
        ephemeral: true
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

    // ✅ 念のため該当チャンネルの存在チェック（任意）
    const channel = interaction.guild.channels.cache.get(selected);
    const channelName = channel ? channel.name : '指定チャンネル';

    await interaction.reply({
      content: `📌 設置チャンネルを <#${selected}>（${channelName}）に設定しました。`,
      ephemeral: true
    });
  }
};
