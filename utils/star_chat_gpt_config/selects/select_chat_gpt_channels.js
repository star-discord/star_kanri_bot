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
      await interaction.deferReply({ flags: MessageFlagsBitField.Flags.Ephemeral });

      // 選択されたチャンネルID（複数選択可の場合は配列）
      const selectedChannels = interaction.values;
      const guildId = interaction.guildId;

      // ChatGPT設定を取得・保存
      const config = await getChatGPTConfig(guildId);
      config.chat_gpt_channels = selectedChannels; // タイポを修正
      await saveChatGPTConfig(guildId, config);

      await interaction.editReply({
        content: `✅ ChatGPTの応答対象チャンネルを ${selectedChannels.map(id => `<#${id}>`).join(', ')} に設定しました。`,
      });
    } catch (error) {
      await logAndReplyError(
        interaction,
        error,
        '❌ チャンネル設定の保存中にエラーが発生しました。'
      );
    }
  },
};
