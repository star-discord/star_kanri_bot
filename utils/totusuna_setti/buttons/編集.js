// utils/totusuna_setti/buttons/編集.js
const fs = require('fs');
const path = require('path');
const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require('discord.js');

module.exports = {
  customIdStart: 'tousuna_edit_button_',

  async handle(interaction) {
    const guildId = interaction.guildId;
    const userId = interaction.user.id;

    const uuid = interaction.customId.replace('tousuna_edit_button_', '');
    const dataPath = path.join(__dirname, '../../../data', guildId, `${guildId}.json`);

    if (!fs.existsSync(dataPath)) {
      return interaction.reply({ content: '⚠ 設定ファイルが見つかりません。', ephemeral: true });
    }

    const json = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    const target = json.totsusuna?.[uuid];

    if (!target) {
      return interaction.reply({ content: '⚠ 該当する設置データが見つかりません。', ephemeral: true });
    }

    const modal = new ModalBuilder()
      .setCustomId(`tousuna_edit_modal_${uuid}`)
      .setTitle('📘 凸スナ設定の編集');

    const bodyInput = new TextInputBuilder()
      .setCustomId('body')
      .setLabel('本文')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true)
      .setValue(target.body.slice(0, 4000)); // Discord制限対応

    const row1 = new ActionRowBuilder().addComponents(bodyInput);
    modal.addComponents(row1);

    await interaction.showModal(modal);
  },
};
