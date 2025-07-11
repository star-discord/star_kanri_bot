// utils/totusuna_setti/selects/install_channel.js

const tempStore = require('../state/totsusunaTemp');

module.exports = {
  customIdStart: 'totusuna_select_main:',

  /**
   * 設置チャンネル選択時の処理
   * @param {import('discord.js').SelectMenuInteraction} interaction
   */
  async handle(interaction) {
    const selected = interaction.values[0]; // 単一選択
    const guildId = interaction.guildId;
    const userId = interaction.user.id;

    const current = tempStore.get(guildId, userId) || {};

    tempStore.set(guildId, userId, {
      ...current,
      installChannelId: selected
    });

    await interaction.reply({
      content: `📌 設置チャンネルを <#${selected}> に設定しました。`,
      ephemeral: true
    });
  }
};
