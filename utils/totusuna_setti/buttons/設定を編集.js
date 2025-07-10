// utils/totusuna_setti/buttons/設定を編集.js
const fs = require('fs');
const path = require('path');
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  async handle(interaction, uuid) {
    const guildId = interaction.guildId;
    const dataPath = path.join(__dirname, '../../../data', guildId, `${guildId}.json`);

    if (!fs.existsSync(dataPath)) {
      return interaction.reply({ content: '⚠️ データファイルが見つかりません。', ephemeral: true });
    }

    const json = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const instance = json?.totsusuna?.[uuid];

    if (!instance) {
      return interaction.reply({ content: '❌ 指定されたUUIDの凸スナ設定が存在しません。', ephemeral: true });
    }

    const modal = new ModalBuilder()
      .setCustomId(`tousuna_edit_modal_${uuid}`)
      .setTitle('📘 本文の編集');

    const bodyInput = new TextInputBuilder()
      .setCustomId('body')
      .setLabel('本文')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true)
      .setValue(instance.body || '');

    modal.addComponents(new ActionRowBuilder().addComponents(bodyInput));

    await interaction.showModal(modal);
  }
};
