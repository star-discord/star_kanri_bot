// utils/totusuna_setti/buttons/設定を編集.js
const fs = require('fs');
const path = require('path');
const { ChannelType, ActionRowBuilder, ChannelSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
  async handle(interaction, uuid) {
    const guildId = interaction.guildId;
    const dataPath = path.join(__dirname, '../../../data', guildId, `${guildId}.json`);
    if (!fs.existsSync(dataPath)) {
      return interaction.reply({ content: '❌ 設定ファイルが存在しません。', ephemeral: true });
    }

    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    const instance = data?.totsusuna?.[uuid];

    if (!instance) {
      return interaction.reply({ content: '⚠️ 対象の凸スナが見つかりません。', ephemeral: true });
    }

    // 本文修正用モーダル（モーダルでまず本文を修正）
    const modal = new ModalBuilder()
      .setCustomId(`tousuna_edit_modal_${uuid}`)
      .setTitle('📄 凸スナ本文の編集');

    const bodyInput = new TextInputBuilder()
      .setCustomId('body')
      .setLabel('本文内容（エンベッドに表示）')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true)
      .setMaxLength(1000)
      .setValue(instance.body || '');

    modal.addComponents(new ActionRowBuilder().addComponents(bodyInput));

    await interaction.showModal(modal);
  }
};
