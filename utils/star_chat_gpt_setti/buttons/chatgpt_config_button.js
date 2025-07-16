// utils/star_chat_gpt_setti/buttons/chatgpt_config_button.js
const { MessageFlagsBitField, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  customId: 'chatgpt_config_button',

  async handle(interaction) {
    try {
      const modal = new ModalBuilder()
        .setCustomId('chatgpt_config_modal')
        .setTitle('⚙️ ChatGPT設定');

      const apiKeyInput = new TextInputBuilder()
        .setCustomId('chatgpt_api_key')
        .setLabel('ChatGPT APIキー')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx')
        .setRequired(false);

      const maxTokensInput = new TextInputBuilder()
        .setCustomId('chatgpt_max_tokens')
        .setLabel('1回の最大返答文字数')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('例: 500')
        .setRequired(false);

      const temperatureInput = new TextInputBuilder()
        .setCustomId('chatgpt_temperature')
        .setLabel('ChatGPTの曖昧さ (0〜1)')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('例: 0.7')
        .setRequired(false);

      modal.addComponents(
        new ActionRowBuilder().addComponents(apiKeyInput),
        new ActionRowBuilder().addComponents(maxTokensInput),
        new ActionRowBuilder().addComponents(temperatureInput)
      );

      await interaction.showModal(modal);
    } catch (error) {
      console.error('ChatGPT設定ボタン処理エラー:', error);
      // エラーを再スローし、中央の buttonsHandler.js で一元管理
      throw error;
    }
  }
};
