// utils/totusuna_setti/buttons/本文入力をする.js
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, InteractionResponseFlags } = require('discord.js');

module.exports = {
  customId: 'tousuna_input_body',

  /**
   * 凸スナ本文入力モーダル表示
   * @param {import('discord.js').ButtonInteraction} interaction
   */
  async handle(interaction) {
    try {
      const modal = new ModalBuilder()
        .setCustomId('tousuna_content_modal')
        .setTitle('凸スナ 本文入力');

      const bodyInput = new TextInputBuilder()
        .setCustomId('body')
        .setLabel('📄 本文を入力してください（例: 報告はこちら！）')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

      modal.addComponents(new ActionRowBuilder().addComponents(bodyInput));

      await interaction.showModal(modal);
    } catch (err) {
      console.error('[本文入力モーダルエラー]', err);
      await interaction.reply({
        content: '❌ モーダルの表示に失敗しました。',
        flags: InteractionResponseFlags.Ephemeral,
      });
    }
  },
};
