const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require('discord.js');

module.exports = {
  async open_content_modal(interaction) {
    const modal = new ModalBuilder()
      .setCustomId('totusuna_content_modal')
      .setTitle('本文入力（設置用）');

    const bodyInput = new TextInputBuilder()
      .setCustomId('main_body')
      .setLabel('本文（記載ルール含めて記述）')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(bodyInput)
    );

    await interaction.showModal(modal);
  }
};
