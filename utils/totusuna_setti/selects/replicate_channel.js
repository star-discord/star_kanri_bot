// utils/totusuna_setti/selects/replicate_channel.js
const { MessageFlagsBitField } = require('discord.js');
const { checkAdmin } = require('../../permissions/checkAdmin');
const tempState = require('../state/totusunaTemp');
const { configManager } = require('../../configManager');

module.exports = {
  customId: 'totusuna_setti:select_replicate',

  /**
   * 複製先チャンネルの選択を処理し、一時状態＆永続化します。
   * @param {import('discord.js').ChannelSelectMenuInteraction} interaction
   */
  async handle(interaction) {
    try {
      await interaction.deferReply({ flags: MessageFlagsBitField.Flags.Ephemeral });

      const isAdmin = await checkAdmin(interaction);
      if (!isAdmin) {
        return await interaction.editReply({ content: '❌ この操作には管理者権限が必要です。' });
      }

      const guildId = interaction.guildId;
      const userId = interaction.user.id;
      const selectedChannelIds = interaction.values || [];

      // 一時状態更新
      const state = tempState.get(guildId, userId) || {};
      state.replicateChannelIds = selectedChannelIds;
      tempState.set(guildId, userId, state);

      // インスタンスIDを一時状態から取得
      const instanceId = state.instanceId;
      if (instanceId) {
        // 永続化：複製チャンネルIDを保存
        await configManager.updateTotusunaInstance(guildId, instanceId, {
          replicateChannelIds: selectedChannelIds,
        });
      }

      if (selectedChannelIds.length > 0) {
        await interaction.editReply({
          content: `✅ 複製チャンネルを ${selectedChannelIds.map(id => `<#${id}>`).join(', ')} に設定しました。`,
        });
      } else {
        await interaction.editReply({ content: '✅ 複製チャンネルを未設定にしました。' });
      }
    } catch (error) {
      console.error(`[replicate_channel] 処理エラー: guild=${interaction.guildId}, user=${interaction.user.id}`, error);
      if (interaction.deferred) {
        await interaction.editReply({ content: '❌ 複製チャンネル設定中にエラーが発生しました。' });
      }
    }
  }
};