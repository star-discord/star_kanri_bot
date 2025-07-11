const { InteractionResponseFlags } = require('discord.js');
const tempState = require('../state/totsusunaTemp');

module.exports = {
  customId: 'totsusuna_setti:select_main_text',

  /**
   * 投稿先チャンネルの選択を処理
   * @param {import('discord.js').StringSelectMenuInteraction} interaction
   */
  async handle(interaction) {
    const guildId = interaction.guildId;
    const userId = interaction.user.id;

    const selectedChannelId = interaction.values?.[0];
    if (!selectedChannelId) {
      return await interaction.reply({
        content: '⚠️ チャンネルが正しく選択されていません。',
        flags: InteractionResponseFlags.Ephemeral,
      });
    }

    // 一時状態に保存（既存があれば統合）
    const prev = tempState.get(guildId, userId) || {};
    tempState.set(guildId, userId, {
      ...prev,
      installChannelId: selectedChannelId,
    });

    await interaction.reply({
      content: `✅ チャンネル <#${selectedChannelId}> が選択されました。`,
      flags: InteractionResponseFlags.Ephemeral,
    });
  },
};
