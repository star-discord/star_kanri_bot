// utils/star_chat_gpt_config/selects/select_chat_gpt_channels.js

const { safeReply } = require('../../safeReply');
const { getChatGPTConfig, saveChatGPTConfig } = require('../configManager');

module.exports = {
  customId: 'star_chat_gpt_config_select_channels',

  /**
   * @param {import('discord.js').SelectMenuInteraction} interaction
   */
  async handle(interaction) {
    try {
      // 選択されたチャンネルID（複数選択可の場合は配列）
      const selectedChannels = interaction.values;
      const guildId = interaction.guildId;

      // ChatGPT設定を取得・保存
      const config = await getChatGPTConfig(guildId);
      config.chat_gpt_channels = selectedChannels;
      await saveChatGPTConfig(guildId, config);

      await safeReply(interaction, {
        content: `ChatGPTの応答対象チャンネルを ${selectedChannels.map(id => `<#${id}>`).join(', ')} に設定しました。`,
        flags: require('discord.js').MessageFlagsBitField.Flags.Ephemeral,
      });
    } catch (error) {
      console.error('star_chat_gpt_config_select_channels処理中にエラー:', error);
      await safeReply(interaction, {
        content: 'エラーが発生しました。もう一度お試しください。',
        flags: require('discord.js').MessageFlagsBitField.Flags.Ephemeral,
      });
    }
  },
};

