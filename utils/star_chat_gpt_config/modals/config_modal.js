// utils/star_chat_gpt_config/modals/config_modal.js

const { getChatGPTConfig, saveChatGPTConfig } = require('../configManager');
const { validateMaxTokens, validateTemperature } = require('../validators');
const { safeReply } = require('../../safeReply');
const { MessageFlagsBitField } = require('discord.js');

module.exports = {
  customId: 'star_chat_gpt_config_modal',
  /**
   * モーダル入力処理
   */
  async handle(interaction) {
    const apiKey = interaction.fields.getTextInputValue('star_chat_gpt_config_api_key')?.trim();
    const apiKey = interaction.fields.getTextInputValue('star_chat_gpt_config_api_key')?.trim();
    const maxTokensStr = interaction.fields.getTextInputValue('max_tokens');
    const temperatureStr = interaction.fields.getTextInputValue('temperature');

    const maxTokens = Number(maxTokensStr);
    const temperature = Number(temperatureStr);

    if (!validateMaxTokens(maxTokens)) {
      return await safeReply(interaction, {
        content: '❌ 「1回の最大返答文字数」は正の整数で入力してください。',
        flags: MessageFlagsBitField.Flags.Ephemeral,
      });
    }

    if (!validateTemperature(temperature)) {
      return await safeReply(interaction, {
        content: '❌ 「ChatGPTの曖昧さ」は0〜1の数値で入力してください。',
        flags: MessageFlagsBitField.Flags.Ephemeral,
      });
    }

    const config = await getChatGPTConfig(interaction.guildId);
    config.maxTokens = maxTokens;
    config.temperature = temperature;
    if (apiKey) { // APIキーが入力された場合のみ更新
      config.apiKey = apiKey;
    }

    await saveChatGPTConfig(interaction.guildId, config);

    await safeReply(interaction, {
      content: '✅ ChatGPTの設定を更新しました。',
      flags: MessageFlagsBitField.Flags.Ephemeral,
    });
  },
};
