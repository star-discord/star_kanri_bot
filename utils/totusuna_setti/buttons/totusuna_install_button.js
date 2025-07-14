const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  MessageFlagsBitField
} = require('discord.js');

module.exports = {
  customId: 'totusuna_install_button', // 命名統一

  /**
   * 凸スナ設置ボタンの処理
   * @param {import('discord.js').ButtonInteraction} interaction
   */
  async handle(interaction) {
    try {
      const modal = new ModalBuilder()
        .setCustomId('totusuna_modal_body_input:install')
        .setTitle('📝 凸スナ本文入力');

      // 本文入力（ParagraphのみsetMaxLength未対応）
      const bodyInput = new TextInputBuilder()
        .setCustomId('body')
        .setLabel('凸スナの本文を入力してください')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder(
          '例）今日の凸スナを報告してください。\n・来店時刻\n・退店時刻\n・売上目標など'
        )
        .setRequired(true);

      // タイトル入力（ShortはsetMaxLength対応しているが、念のため除去し検証は送信後に）
      const titleInput = new TextInputBuilder()
        .setCustomId('title')
        .setLabel('タイトル（省略可能）')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('例）本日の凸スナ報告')
        .setRequired(false);

      modal.addComponents(
        new ActionRowBuilder().addComponents(titleInput),
        new ActionRowBuilder().addComponents(bodyInput),
      );

      await interaction.showModal(modal);
    } catch (error) {
      console.error('凸スナ設置ボタンエラー:', error);

      const errorReply = {
        content: '❌ 凸スナ設置処理中にエラーが発生しました。',
        flags: MessageFlagsBitField.Ephemeral,
      };

      try {
        if (interaction.deferred && !interaction.replied) {
          await interaction.editReply(errorReply);
        } else if (!interaction.replied) {
          await interaction.reply(errorReply);
        }
        // それ以外は無視（reply済みなど）
      } catch (sendError) {
        console.error('エラーメッセージ送信失敗:', sendError);
      }
    }
  },
};
