const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
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
        .setCustomId('totusuna_body_input_modal')
        .setTitle('📝 凸スナ本文設定');

      const bodyInput = new TextInputBuilder()
        .setCustomId('totusuna_body')
        .setLabel('凸スナの本文を入力してください')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('例: 今日の凸スナを報告してください。\n\n・来店時間:\n・退店時間:\n・売上金額:')
        .setRequired(true)
        .setMaxLength(1000);

      const titleInput = new TextInputBuilder()
        .setCustomId('totusuna_title')
        .setLabel('タイトル（省略可）')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('例: 本日の凸スナ報告')
        .setRequired(false)
        .setMaxLength(100);

      const firstActionRow = new ActionRowBuilder().addComponents(titleInput);
      const secondActionRow = new ActionRowBuilder().addComponents(bodyInput);

      modal.addComponents(firstActionRow, secondActionRow);

      await interaction.showModal(modal);

    } catch (error) {
      console.error('凸スナ設置ボタンエラー:', error);
      await interaction.reply({
        content: '❌ 凸スナ設置処理中にエラーが発生しました。',
        ephemeral: true
      });
    }
  }
};
