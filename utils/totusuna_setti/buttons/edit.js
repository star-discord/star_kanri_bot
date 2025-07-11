const fs = require('fs');
const path = require('path');
const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  InteractionResponseFlags, // 追加
} = require('discord.js');

module.exports = {
  customIdStart: 'totusuna_setti:edit:',

  /**
   * Show modal to edit Totsusuna body
   * @param {import('discord.js').ButtonInteraction} interaction
   */
  async handle(interaction) {
    const guildId = interaction.guildId;
    const customId = interaction.customId;
    const uuid = customId.replace(this.customIdStart, '');

    const filePath = path.join(__dirname, '../../../data', guildId, `${guildId}.json`);
    if (!fs.existsSync(filePath)) {
      return await interaction.reply({
        content: '⚠ Data file not found.',
        flags: InteractionResponseFlags.Ephemeral,
      });
    }

    let json;
    try {
      json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (err) {
      console.error('Failed to parse JSON:', err);
      return await interaction.reply({
        content: '❌ Failed to read the data file.',
        flags: InteractionResponseFlags.Ephemeral,
      });
    }

    const target = json.totusuna?.instances?.[uuid];
    if (!target) {
      return await interaction.reply({
        content: '⚠ The specified Totsusuna instance could not be found.',
        flags: InteractionResponseFlags.Ephemeral,
      });
    }

    const modal = new ModalBuilder()
      .setCustomId(`totusuna_edit_modal:${uuid}`)
      .setTitle('📘 Edit Totsusuna Message Body');

    const input = new TextInputBuilder()
      .setCustomId('body')
      .setLabel('Message Body')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true)
      .setValue(target.body || '');

    modal.addComponents(new ActionRowBuilder().addComponents(input));

    await interaction.showModal(modal);
  }
};
