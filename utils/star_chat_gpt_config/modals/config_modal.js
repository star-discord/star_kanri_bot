// utils/star_chat_gpt_config/selects/select_chat_gpt_channels.js

const { getChatGPTConfig, saveChatGPTConfig } = require('../configManager');
const { safeReply } = require('../../safeReply');
const { MessageFlagsBitField } = require('discord.js');

module.exports = {
  customId: 'select_chat_gpt_channels',
  /**
   * 応答対象チャンネルの保存処理
   */
  async handle(interaction) {
    const selectedChannels = interaction.values;

    const config = await getChatGPTConfig(interaction.guildId);
    config.chat_gpt_channels = selectedChannels;

    await saveChatGPTConfig(interaction.guildId, config);

    await safeReply(interaction, {
      content: '✅ ChatGPT応答対象チャンネルを更新しました。',
      flags: MessageFlagsBitField.Flags.Ephemeral,
    });
  },
};
