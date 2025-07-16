// utils/star_chat_gpt_config/buttons/open_config_modal.js

const {
  ModalBuilder,
  ActionRowBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');
const { getChatGPTConfig } = require('../configManager');
const { safeShowModal } = require('../../safeReply');

module.exports = {
  customId: 'star_chat_gpt:open_config_modal',
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

    modal.addComponents(
      new ActionRowBuilder().addComponents(maxTokensInput),
      new ActionRowBuilder().addComponents(temperatureInput)
    );

    await safeShowModal(interaction, modal);
  },
};
