// utils/star_chat_gpt_setti/buttons/chatgpt_config_button.js
const { MessageFlags, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  customId: 'chatgpt_config_button',
  
  async handle(interaction) {
    try {
      const modal = new ModalBuilder()
        .setCustomId('chatgpt_config_modal')
        .setTitle('🤁EChatGPT設宁E);

      const apiKeyInput = new TextInputBuilder()
        .setCustomId('chatgpt_api_key')
        .setLabel('ChatGPT APIキー')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx')
        .setRequired(false);

      const maxTokensInput = new TextInputBuilder()
        .setCustomId('chatgpt_max_tokens')
        .setLabel('最大ト�Eクン数')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('侁E 150')
        .setRequired(false);

      const temperatureInput = new TextInputBuilder()
        .setCustomId('chatgpt_temperature')
        .setLabel('温度設宁E(0.0-2.0)')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('侁E 0.7')
        .setRequired(false);

      const row1 = new ActionRowBuilder().addComponents(apiKeyInput);
      const row2 = new ActionRowBuilder().addComponents(maxTokensInput);
      const row3 = new ActionRowBuilder().addComponents(temperatureInput);

      modal.addComponents(row1, row2, row3);

      await interaction.showModal(modal);

    } catch (error) {
      console.error('ChatGPT設定�Eタン処琁E��ラー:', error);
      
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❁E設定画面の表示中にエラーが発生しました、E,
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  }
};
