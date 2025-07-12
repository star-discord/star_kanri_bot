const fs = require('fs');
const path = require('path');
const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder
} = require('discord.js');

module.exports = {
  customId: 'totusuna_config:設定を編雁E,

  /**
   * 凸スナ本斁E�E編雁E��ーダル表示
   * @param {import('discord.js').ButtonInteraction} interaction
   * @param {string} uuid
   */
  async handle(interaction, uuid) {
    const guildId = interaction.guildId;
    const dataPath = path.join(__dirname, '../../../data', guildId, `${guildId}.json`);

    if (!fs.existsSync(dataPath)) {
      return await interaction.reply({
        content: '⚠�E�EチE�Eタファイルが見つかりません、E,
        flags: 1 << 6 // ephemeralに対忁E      });
    }

    const json = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const instance = json.tousuna?.instances?.find(i => i.id === uuid);

    if (!instance) {
      return await interaction.reply({
        content: '⚠�E�E持E��された設置が見つかりません、E,
        flags: 1 << 6
      });
    }

    const modal = new ModalBuilder()
      .setCustomId(`tousuna_config_edit_modal_${uuid}`)
      .setTitle('📄 本斁E�E修正');

    const bodyInput = new TextInputBuilder()
      .setCustomId('body')
      .setLabel('本斁E�E容')
      .setStyle(TextInputStyle.Paragraph)
      .setValue(instance.body || '')
      .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(bodyInput));

    await interaction.showModal(modal);
  }
};
