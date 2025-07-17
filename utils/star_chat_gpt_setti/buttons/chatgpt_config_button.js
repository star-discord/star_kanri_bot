// utils/star_chat_gpt_setti/buttons/chatgpt_config_button.js
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, MessageFlagsBitField } = require('discord.js');
const { safeReply } = require('../../safeReply');

module.exports = {
  customId: 'star_chatgpt_setti_config_button',

  /**
   * ボタン押下時の処理（モーダル表示）
   * @param {import('discord.js').ButtonInteraction} interaction
   */
  async handle(interaction) {
    try {
      const modal = new ModalBuilder()
        .setCustomId('star_chatgpt_setti_modal')
        .setTitle('⚙️ ChatGPT設定');

      const apiKeyInput = new TextInputBuilder()
        .setCustomId('star_chat_gpt_config_api_key')
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

      // モーダル表示は即時応答なので await で呼び出し
      await interaction.showModal(modal);
      
    } catch (error) {
      console.error('ChatGPT設定ボタン処理エラー:', error);

      // 何らかの理由でモーダル表示失敗時に安全に通知を返す
      try {
        await safeReply(interaction, {
          content: '⚠️ 設定モーダルの表示中にエラーが発生しました。',
          flags: MessageFlagsBitField.Flags.Ephemeral,
        });
      } catch (replyError) {
        console.error('エラー通知送信失敗:', replyError);
      }
    }
  }
};
