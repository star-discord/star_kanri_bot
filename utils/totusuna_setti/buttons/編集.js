const fs = require('fs');
const path = require('path');
const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  InteractionResponseFlags,
} = require('discord.js');

module.exports = {
  customIdStart: 'tousuna_edit_',

  async handle(interaction) {
    const guildId = interaction.guildId;
    const customId = interaction.customId;
    const uuid = customId.replace('tousuna_edit_', '');

    const filePath = path.join(__dirname, '../../../data', guildId, `${guildId}.json`);
    if (!fs.existsSync(filePath)) {
      return await interaction.reply({
        content: '⚠ データが存在しません。',
        flags: InteractionResponseFlags.Ephemeral,
      });
    }

    const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const target = json.tousuna?.instances?.find(i => i.id === uuid);

    if (!target) {
      return await interaction.reply({
        content: '⚠ 該当する凸スナが見つかりません。',
        flags: InteractionResponseFlags.Ephemeral,
      });
    }

    const modal = new ModalBuilder()
      .setCustomId(`tousuna_edit_modal_${uuid}`)
      .setTitle('📘 凸スナ本文の編集');

    const input = new TextInputBuilder()
      .setCustomId('body')
      .setLabel('本文')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true)
      .setValue(target.body || '');

    modal.addComponents(new ActionRowBuilder().addComponents(input));

    await interaction.showModal(modal);
  },
};
