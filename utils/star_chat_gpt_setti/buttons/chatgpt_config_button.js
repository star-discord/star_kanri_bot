// utils/star_chat_gpt_setti/buttons/chatgpt_config_button.js

const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, MessageFlagsBitField } = require('discord.js');
const { safeReply } = require('../../safeReply');

module.exports = {
  // ボタンのcustomIdはコロン付きのプレフィックス形式で統一
  customId: 'star_chat_gpt_setti:open_config',

  /**
   * ボタン押下時の処理（モーダル表示）
   * @param {import('discord.js').ButtonInteraction} interaction
   */
  async handle(interaction) {
    try {
      // モーダル作成
      const modal = new ModalBuilder()
        .setCustomId('star_chat_gpt_setti_modal') // モーダルのcustomIdはプレフィックス無しの固定文字列に

        .setTitle('⚙️ ChatGPT設定');

      // APIキー入力
      const apiKeyInput = new TextInputBuilder()
        .setCustomId('api_key') // モーダル側での取得IDと一致させる
        .setLabel('ChatGPT APIキー (任意)')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx')
        .setRequired(false);

      // 最大トークン数入力
      const maxTokensInput = new TextInputBuilder()
        .setCustomId('max_tokens')
        .setLabel('1回の最大返答文字数')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('例: 500')
        .setRequired(false);

      // 曖昧さ入力
      const temperatureInput = new TextInputBuilder()
        .setCustomId('temperature')
        .setLabel('ChatGPTの曖昧さ (0〜1)')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('例: 0.7')
        .setRequired(false);

      modal.addComponents(
        new ActionRowBuilder().addComponents(apiKeyInput),
        new ActionRowBuilder().addComponents(maxTokensInput),
        new ActionRowBuilder().addComponents(temperatureInput),
      );

      // モーダルを表示（即時応答）
      await interaction.showModal(modal);

    } catch (error) {
      console.error('ChatGPT設定ボタン処理エラー:', error);

      // エラー時の安全な通知
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
