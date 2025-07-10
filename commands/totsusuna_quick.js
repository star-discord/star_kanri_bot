const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('凸スナクイック設置')
    .setDescription('即時に凸スナ設置を行います（本文のみ）')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const modal = new ModalBuilder()
      .setCustomId('quick_input_modal')
      .setTitle('クイック凸スナ本文入力');

    const input = new TextInputBuilder()
      .setCustomId('body')
      .setLabel('本文を入力してください')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(input));

    await interaction.showModal(modal);
  },
};
