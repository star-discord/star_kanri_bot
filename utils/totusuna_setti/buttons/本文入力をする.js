// utils/totusuna_setti/buttons/本文入力をする.js
const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require('discord.js');

module.exports = async function (interaction) {
  const modal = new ModalBuilder()
    .setCustomId('totusuna_content_modal')
    .setTitle('凸スナ本文入力');

  const bodyInput = new TextInputBuilder()
    .setCustomId('main_body')
    .setLabel('凸スナ本文（記載ルールなど）')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true);

  const row = new ActionRowBuilder().addComponents(bodyInput);

  modal.addComponents(row);
  await interaction.showModal(modal);
};
