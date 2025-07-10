// utils/totusuna_setti/buttons.js
const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require('discord.js');
const path = require('path');
const fs = require('fs');

module.exports = {
  async handle(interaction) {
    const customId = interaction.customId;

    // 例: tousuna_report_button_550e8400-e29b-41d4-a716-446655440000
    const match = customId.match(/^tousuna_report_button_(.+)$/);
    if (!match) return;

    const instanceId = match[1];
    const guildId = interaction.guildId;
    const dataPath = path.join(__dirname, `../../../data/${guildId}/${guildId}.json`);

    if (!fs.existsSync(dataPath)) return;

    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const instance = data?.tousuna?.instances?.find(i => i.id === instanceId);
    if (!instance) return;

    // 凸スナ報告用モーダルの生成
    const modal = new ModalBuilder()
      .setCustomId(`tousuna_modal_${instanceId}`)
      .setTitle('凸スナ報告');

    const groupInput = new TextInputBuilder()
      .setCustomId('group')
      .setLabel('何組')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const nameInput = new TextInputBuilder()
      .setCustomId('name')
      .setLabel('何名')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const table1 = new TextInputBuilder()
      .setCustomId('table1')
      .setLabel('卓1（任意）')
      .setStyle(TextInputStyle.Short)
      .setRequired(false);

    const table2 = new TextInputBuilder()
      .setCustomId('table2')
      .setLabel('卓2（任意）')
      .setStyle(TextInputStyle.Short)
      .setRequired(false);

    const table3 = new TextInputBuilder()
      .setCustomId('table3')
      .setLabel('卓3（任意）')
      .setStyle(TextInputStyle.Short)
      .setRequired(false);

    const table4 = new TextInputBuilder()
      .setCustomId('table4')
      .setLabel('卓4（任意）')
      .setStyle(TextInputStyle.Short)
      .setRequired(false);

    const detailInput = new TextInputBuilder()
      .setCustomId('detail')
      .setLabel('詳細（任意）')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(false);

    modal.addComponents(
      new ActionRowBuilder().addComponents(groupInput),
      new ActionRowBuilder().addComponents(nameInput),
      new ActionRowBuilder().addComponents(table1),
      new ActionRowBuilder().addComponents(table2),
      new ActionRowBuilder().addComponents(table3),
      new ActionRowBuilder().addComponents(table4),
      new ActionRowBuilder().addComponents(detailInput),
    );

    await interaction.showModal(modal);
  },
};
