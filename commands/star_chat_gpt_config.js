// commands/star_chat_gpt_config.js

const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, MessageFlagsBitField } = require('discord.js');
const { checkAdmin } = require('../utils/permissions/checkAdmin');
const { logAndReplyError } = require('../utils/errorHelper');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('star_chat_gpt_config')
    .setDescription('ChatGPTの応答設定をモーダルで行います'),

  async execute(interaction) {
    try {
      // モーダル表示は即時応答であり、deferReply() とは併用不可。
      // したがって、deferReply() は削除し、先に権限チェックを行います。

      const isAdmin = await checkAdmin(interaction);
      if (!isAdmin) {
        // deferReply() をしていないため、editReply() ではなく reply() で応答します。
        return interaction.reply({ content: '❌ 権限がありません。管理者のみ使用可能です。', flags: MessageFlagsBitField.Flags.Ephemeral });
      }

      const modal = new ModalBuilder()
        .setCustomId('star_chat_gpt_config_modal')
        .setTitle('ChatGPT設定');

      const apiKeyInput = new TextInputBuilder()
        .setCustomId('apiKey')
        .setLabel('APIキー (任意)')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('sk-********************************')
        .setRequired(false);
        
      const maxTokensInput = new TextInputBuilder()
        .setCustomId('max_tokens')
        .setLabel('最大応答文字数')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('例: 500')
        .setRequired(true);

      const temperatureInput = new TextInputBuilder()
        .setCustomId('temperature')
        .setLabel('ChatGPTの曖昧さ (0〜1)')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('例: 0.7')
        .setRequired(true);
        
      modal.addComponents(
         new ActionRowBuilder().addComponents(apiKeyInput),
        new ActionRowBuilder().addComponents(maxTokensInput),
      );

      // deferReply() を削除したため、showModal() は安全に実行できます。
      await interaction.showModal(modal);
    } catch (error) {
      console.error('star_chat_gpt_config 実行エラー:', error);
      await logAndReplyError(interaction, error, 'エラーが発生しました。しばらくしてから再試行してください。');
    }
  },
};
