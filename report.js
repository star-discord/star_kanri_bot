// utils/totusuna_report/buttons/report.js
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const { idManager } = require('../../idManager');
const { safeReply } = require('../../safeReply');

/**
 * Handles the "凸スナ報告" button press by showing a modal.
 * @param {import('discord.js').ButtonInteraction} interaction
 */
async function actualHandler(interaction) {
  // Extract the UUID from the button's customId
  const uuid = interaction.customId.split(':')[2];
  if (!uuid) {
    return await safeReply(interaction, {
      content: '❌ この報告ボタンは無効です。もう一度やり直してください。',
        ephemeral: true,
    });
  }

  await safeReply(interaction, {
    embeds: [embed],
    ephemeral: true,
  });
}

module.exports = {
  customIdStart: 'totusuna:report:',
  handle: actualHandler,
};