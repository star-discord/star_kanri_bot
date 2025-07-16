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
      await interaction.deferReply({ flags: MessageFlagsBitField.Flags.Ephemeral });

      const isAdmin = await checkAdmin(interaction);
      if (!isAdmin) {
        return interaction.editReply({ content: '❌ 権限がありません。管理者のみ使用可能です。' });
      }

      const modal = new ModalBuilder()
        .setCustomId('chatgpt_config_modal')
        .setTitle('ChatGPT設定');

      const personalityInput = new TextInputBuilder()
        .setCustomId('personality')
        .setLabel('ChatGPTの性格設定')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('例: 優しく丁寧に回答してください')
        .setRequired(true);

      const maxTokensInput = new TextInputBuilder()
        .setCustomId('max_tokens')
        .setLabel('最大応答文字数')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('例: 500')
        .setRequired(true);

      modal.addComponents(
        new ActionRowBuilder().addComponents(personalityInput),
        new ActionRowBuilder().addComponents(maxTokensInput)
      );

      await interaction.showModal(modal);
    } catch (error) {
      console.error('star_chat_gpt_config 実行エラー:', error);
      await logAndReplyError(interaction, error, 'エラーが発生しました。しばらくしてから再試行してください。');
    }
  },
};
