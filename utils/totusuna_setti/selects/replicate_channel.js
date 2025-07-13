// utils/totusuna_setti/selects/replicate_channel.js
const { MessageFlags } = require('discord.js');
const tempState = require('../state/totsusunaTemp');

/**
 * 複製投稿チャンネル選択ハンドラ
 */
module.exports = {
  customId: 'totsusuna_setti:select_replicate', // 実際のselectメニューのcustomIdに合わせる

  /**
   * @param {import('discord.js').StringSelectMenuInteraction} interaction
   */
  async handle(interaction) {
    if (!interaction.isStringSelectMenu()) return;

    const guildId = interaction.guildId;
    const userId = interaction.user.id;

    // 選択されたチャンネルID一覧を取得
    const selectedChannelIds = interaction.values;

    // 一時データを取得し、更新
    const state = tempState.get(guildId, userId) || {};
    state.replicateChannelIds = selectedChannelIds;
    tempState.set(guildId, userId, state);

    await interaction.reply({
      content: `🌀 複製投稿チャンネルを設定しました: ${selectedChannelIds.join(', ')}`,
      flags: MessageFlags.Ephemeral,
    });
  }
};
