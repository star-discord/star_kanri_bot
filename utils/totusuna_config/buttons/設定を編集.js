const fs = require('fs');
const path = require('path');
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  async handle(interaction) {
    const guildId = interaction.guildId;
    const uuid = interaction.customId.replace('tousuna_edit_button_', '');
    const filePath = path.join(__dirname, `../../../data/${guildId}/${guildId}.json`);

    if (!fs.existsSync(filePath)) {
      return interaction.reply({ content: '⚠ データファイルが存在しません。', flags: InteractionResponseFlags.Ephemeral });
    }

    const json = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const instance = json.totsusuna?.[uuid];

    if (!instance) {
      return interaction.reply({ content: '⚠ 指定されたデータが見つかりません。', flags: InteractionResponseFlags.Ephemeral });
    }

    const modal = new ModalBuilder()
      .setCustomId(`edit_body_modal_${uuid}`)
      .setTitle('📄 本文の修正');

    const bodyInput = new TextInputBuilder()
      .setCustomId('body')
      .setLabel('本文内容')
      .setStyle(TextInputStyle.Paragraph)
      .setValue(instance.body || '')
      .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(bodyInput));

    await interaction.showModal(modal);
  },
};
