// utils/star_chat_gpt_config/modals/config_modal.js

const { configManager } = require('../configManager');
const { validateMaxTokens, validateTemperature } = require('../validators');
const { safeReply } = require('../../safeReply');
const { MessageFlagsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
  customId: 'star_chat_gpt_config_modal',

  /**
   * モーダル入力処理
   * @param {import('discord.js').ModalSubmitInteraction} interaction
   */
  async handle(interaction) {
    const apiKey = interaction.fields.getTextInputValue('star_chat_gpt_config_api_key')?.trim();
    const maxTokensStr = interaction.fields.getTextInputValue('max_tokens');
    const temperatureStr = interaction.fields.getTextInputValue('temperature');

    const maxTokens = Number(maxTokensStr);
    const temperature = Number(temperatureStr);

    // NaNチェックを含むバリデーション
    if (isNaN(maxTokens) || !validateMaxTokens(maxTokens)) {
      return await safeReply(interaction, {
        content: '❌ 「1回の最大返答文字数」は正の整数で入力してください。',
        flags: MessageFlagsBitField.Flags.Ephemeral,
      });
    }
    if (isNaN(temperature) || !validateTemperature(temperature)) {
      return await safeReply(interaction, {
        content: '❌ 「ChatGPTの曖昧さ」は0〜1の数値で入力してください。',
        flags: MessageFlagsBitField.Flags.Ephemeral,
      });
    }

    // 設定取得・更新
    try {
      const config = await configManager.getChatGPTConfig(interaction.guildId);
      config.maxTokens = maxTokens;
      config.temperature = temperature;
      if (apiKey) {
        config.apiKey = apiKey;
      }
      await configManager.updateChatGPTConfig(interaction.guildId, config);
    } catch (error) {
      console.error(`⚠️ ChatGPT設定の更新に失敗しました (Guild: ${interaction.guildId}):`, error);
      return await safeReply(interaction, {
        content: '❌ 設定の保存に失敗しました。時間を置いて再度お試しください。',
        flags: MessageFlagsBitField.Flags.Ephemeral,
      });
    }

    // ユーザーへの応答
    await safeReply(interaction, {
      content: '✅ ChatGPTの設定を更新しました。',
      flags: MessageFlagsBitField.Flags.Ephemeral,
    });

    // 通知チャンネルへログ送信
    try {
      const guildConfig = await configManager.getGuildConfig(interaction.guildId);
      const notifyChannelId = guildConfig.star?.notifyChannelId;
      if (!notifyChannelId) return;

      const notifyChannel = await interaction.client.channels.fetch(notifyChannelId).catch(() => null);
      if (!notifyChannel?.isTextBased()) return;

      const embed = new EmbedBuilder()
        .setTitle('🤖 ChatGPT設定が更新されました')
        .setDescription('以下の内容に変更されました：')
        .addFields(
          { name: 'APIキー', value: apiKey ? '🔑 設定済み（非表示）' : '（変更なし）', inline: false },
          { name: '最大トークン数', value: String(maxTokens), inline: true },
          { name: '曖昧さ（temperature）', value: String(temperature), inline: true }
        )
        .setColor(0x00bcd4)
        .setTimestamp()
        .setFooter({ text: `設定者: ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

      await notifyChannel.send({ embeds: [embed] });
    } catch (error) {
      console.warn(`⚠️ 通知チャンネルへの送信に失敗しました (Guild: ${interaction.guildId}):`, error);
    }
  },
};
