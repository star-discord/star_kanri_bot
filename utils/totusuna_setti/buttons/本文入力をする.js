// utils/totusuna_setti/buttons/本文入力をする.js
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  customId: 'tousuna_input_body',

  async handle(interaction) {
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
  },
};
