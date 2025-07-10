// utils/totusuna_setti/buttons/設定を編集.js
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
  async handle(interaction, uuid) {
    const guildId = interaction.guildId;
    const dataPath = path.join(__dirname, '../../../data', guildId, `${guildId}.json`);

    if (!fs.existsSync(dataPath)) {
      return await interaction.reply({
        content: '⚠️ データファイルが見つかりません。',
        flags: InteractionResponseFlags.Ephemeral,
      });
    }

    const json = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    const instance = json.tousuna?.instances?.find(i => i.id === uuid);

    if (!instance) {
      return await interaction.reply({
        content: '⚠️ 指定された設置情報が存在しません。',
        flags: InteractionResponseFlags.Ephemeral,
      });
    }

    const modal = new ModalBuilder()
      .setCustomId(`tousuna_edit_modal_${uuid}`)
      .setTitle('📘 凸スナ本文を編集');

    const bodyInput = new TextInputBuilder()
      .setCustomId('body')
      .setLabel('本文メッセージ')
      .setStyle(TextInputStyle.Paragraph)
      .setValue(instance.body || '')
      .setRequired(true);

    const row = new ActionRowBuilder().addComponents(bodyInput);
    modal.addComponents(row);

    await interaction.showModal(modal);
  },
};
