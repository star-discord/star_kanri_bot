const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  MessageFlagsBitField
} = require('discord.js');
const { createAdminEmbed } = require('../../embedHelper');

module.exports = {
  customId: 'totusuna_install_button',

  /**
   * 凸スナ設置ボタンの処理
   * @param {import('discord.js').ButtonInteraction} interaction
   */
  async handle(interaction) {
    try {
      // 凸スナ本文入力用のモーダルを表示
      const modal = new ModalBuilder()
        .setCustomId('totsusuna_modal_body_input:install')
        .setTitle('📝 凸スナ本文入力');

      const bodyInput = new TextInputBuilder()
        .setCustomId('body')
        .setLabel('凸スナの本文を入力してください')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('例）今日の凸スナを報告してください。\n・来店時刻\n・退店時刻\n・売上目標など')
        .setRequired(true)
        .setMaxLength(1000);

      const titleInput = new TextInputBuilder()
        .setCustomId('title')
        .setLabel('タイトル（省略可能）')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('例）本日の凸スナ報告')
        .setRequired(false)
        .setMaxLength(100);

      const firstActionRow = new ActionRowBuilder().addComponents(titleInput);
      const secondActionRow = new ActionRowBuilder().addComponents(bodyInput);

      modal.addComponents(firstActionRow, secondActionRow);

      await interaction.showModal(modal);

    } catch (error) {
      console.error('凸スナ設置ボタンエラー:', error);
      const errorReply = {
        content: '❌ 凸スナ設置処理中にエラーが発生しました。',
        flags: MessageFlagsBitField.Ephemeral
      };
      try {
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply(errorReply);
        } else if (interaction.deferred && !interaction.replied) {
          await interaction.editReply(errorReply);
        } else {
          await interaction.followUp(errorReply);
        }
      } catch (followUpError) {
        console.error('エラーメッセージの送信にも失敗しました:', followUpError);
      }
    }
  }
};
