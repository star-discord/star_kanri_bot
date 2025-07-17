// utils/star_chat_gpt_config/selects/select_chat_gpt_channels.js

const { MessageFlagsBitField } = require('discord.js');
const { logAndReplyError } = require('../../errorHelper');
const { getChatGPTConfig, saveChatGPTConfig } = require('../configManager');

module.exports = {
  customId: 'star_chat_gpt_config_select_channels',

  /**
   * @param {import('discord.js').StringSelectMenuInteraction} interaction
   */
  async handle(interaction) {
    try {
      await interaction.deferReply({ ephemeral: true });

      // 選択されたチャンネルID（複数選択可）
      const selectedChannels = interaction.values;
      const guildId = interaction.guildId;

      // ChatGPT設定を取得・保存
      const config = await getChatGPTConfig(guildId);
      config.chat_gpt_channels = selectedChannels; // タイポ修正済み
      await saveChatGPTConfig(guildId, config);

      // 処理完了メッセージ
      await interaction.editReply({
        content: `✅ ChatGPTの応答対象チャンネルを ${selectedChannels.map(id => `<#${id}>`).join(', ')} に設定しました。`,
      });

    } catch (error) {
      console.error('star_chat_gpt_config_select_channels処理中にエラー:', error);
      await logAndReplyError(
        interaction,
        error,
        '❌ チャンネル設定の保存中にエラーが発生しました。'
      );
    }
  },
};
