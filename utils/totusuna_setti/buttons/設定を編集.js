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
  customIdStart: 'totsusuna_setti:設定を編集:',

  /**
   * 凸スナ設置の編集モーダル表示
   * @param {import('discord.js').ButtonInteraction} interaction
   */
  async handle(interaction) {
    const guildId = interaction.guildId;
    const uuid = interaction.customId.replace(this.customIdStart, '');
    const dataPath = path.join(__dirname, '../../../data', guildId, `${guildId}.json`);

    if (!fs.existsSync(dataPath)) {
      return await interaction.reply({
        content: '⚠️ データファイルが見つかりません。',
        flags: InteractionResponseFlags.Ephemeral,
      });
    }

    const json = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    const instances = json.totsusuna?.instances;

    if (!Array.isArray(instances)) {
      return await interaction.reply({
        content: '⚠️ インスタンスデータが見つかりません。',
        flags: InteractionResponseFlags.Ephemeral,
      });
    }

    const instance = instances.find(i => i.id === uuid);

    if (!instance) {
      return await interaction.reply({
        content: '⚠️ 指定された設置情報が存在しません。',
        flags: InteractionResponseFlags.Ephemeral,
      });
    }

    const modal = new ModalBuilder()
      .setCustomId(`totsusuna_edit_modal_${uuid}`)
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
