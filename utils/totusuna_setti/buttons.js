// utils/totusuna_setti/buttons.js
const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder
} = require('discord.js');

module.exports = {
  async openContentModal(interaction) {
    const modal = new ModalBuilder()
      .setCustomId('totusuna_content_modal')
      .setTitle('凸スナ 本文入力（設置用）');

    const bodyInput = new TextInputBuilder()
      .setCustomId('main_body')
      .setLabel('本文（ルール含む）')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(bodyInput)
    );

    await interaction.showModal(modal);
  }
};
