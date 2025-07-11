// utils/totusuna_setti/buttons/input_body.js
const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  InteractionResponseFlags,
} = require('discord.js');

module.exports = {
  customId: 'totsusuna_setti:input_body',

  /**
   * Show modal for entering Totsusuna message body
   * @param {import('discord.js').ButtonInteraction} interaction
   */
  async handle(interaction) {
    try {
      const modal = new ModalBuilder()
        .setCustomId('totsusuna_content_modal')
        .setTitle('📘 Enter Totsusuna Message Body');

      const bodyInput = new TextInputBuilder()
        .setCustomId('body')
        .setLabel('📄 Please enter the message body (e.g., Report here!)')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

      modal.addComponents(
        new ActionRowBuilder().addComponents(bodyInput)
      );

      await interaction.showModal(modal);
    } catch (err) {
      console.error('[totsusuna_setti:input_body] Failed to show modal:', err);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ Failed to show the input modal.',
          flags: InteractionResponseFlags.Ephemeral,
        });
      }
    }
  },
};
