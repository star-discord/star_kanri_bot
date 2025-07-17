// utils/star_chat_gpt_config/buttons/open_config_modal.js

const {
  ModalBuilder,
  ActionRowBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');
const { getChatGPTConfig } = require('../configManager');

module.exports = {
  customId: 'star_chat_gpt_config:open_config_modal',
  /**
   * ChatGPT設定用モーダルを表示
   */
  async handle(interaction) {
    const config = await getChatGPTConfig(interaction.guildId);

    const modal = new ModalBuilder()
      .setCustomId('star_chat_gpt_config_modal')
      .setTitle('ChatGPT設定を変更');

    const maxTokensInput = new TextInputBuilder()
      .setCustomId('max_tokens')
      .setLabel('1回の最大返答文字数')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('例: 500')
      .setRequired(true)
      .setValue(config.maxTokens !== undefined ? config.maxTokens.toString() : '');

    const temperatureInput = new TextInputBuilder()
      .setCustomId('temperature')
      .setLabel('ChatGPTの曖昧さ（0〜1）')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('例: 0.7')
      .setRequired(true)
      .setValue(config.temperature !== undefined ? config.temperature.toString() : '');

    const personaInput = new TextInputBuilder()
      .setCustomId('persona')
      .setLabel('性格（任意）')
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('例: あなたは礼儀正しい執事です。')
      .setRequired(false)
      .setValue(config.persona || '');

    modal.addComponents(
      new ActionRowBuilder().addComponents(maxTokensInput),
      new ActionRowBuilder().addComponents(temperatureInput),
      new ActionRowBuilder().addComponents(personaInput)
    );
    
    await interaction.showModal(modal);
  },
};
