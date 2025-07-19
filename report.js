// utils/totusuna_report/buttons/report.js
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const { idManager } = require('../../idManager');
const { safeReply } = require('../../safeReply');
const { logAndReplyError } = require('../../errorHelper');

/**
 * Handles the "凸スナ報告" button press by showing a modal.
 * @param {import('discord.js').ButtonInteraction} interaction
 */
async function actualHandler(interaction) {
  try {
    // Extract the UUID from the button's customId
    const uuid = interaction.customId.split(':')[2];
    if (!uuid) {
      return await safeReply(interaction, {
        content: '❌ この報告ボタンは無効です。もう一度やり直してください。',
        ephemeral: true,
      });
    }

    // Create the modal for submitting a report.
    const modal = new ModalBuilder()
      .setCustomId(idManager.createModalId('totusuna_report', 'submit', uuid))
      .setTitle('📝 凸スナ報告フォーム');

    // Create text inputs for the modal.
    const groupInput = new TextInputBuilder()
      .setCustomId('group')
      .setLabel('組数（例: 1組）')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const nameInput = new TextInputBuilder()
      .setCustomId('name')
      .setLabel('人数（例: 3名）')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const table1Input = new TextInputBuilder()
      .setCustomId('table1')
      .setLabel('卓1（任意）')
      .setStyle(TextInputStyle.Short)
      .setRequired(false);

    const table2Input = new TextInputBuilder()
      .setCustomId('table2')
      .setLabel('卓2（任意）')
      .setStyle(TextInputStyle.Short)
      .setRequired(false);

    const detailInput = new TextInputBuilder()
      .setCustomId('detail')
      .setLabel('詳細・補足（任意）')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(false);

    // Add inputs to the modal.
    modal.addComponents(
      new ActionRowBuilder().addComponents(groupInput),
      new ActionRowBuilder().addComponents(nameInput),
      new ActionRowBuilder().addComponents(table1Input),
      new ActionRowBuilder().addComponents(table2Input),
      new ActionRowBuilder().addComponents(detailInput)
    );

    // Show the modal to the user.
    await interaction.showModal(modal);

  } catch (error) {
    await logAndReplyError(interaction, error, '❌ フォームの表示中にエラーが発生しました。');
  }
}

module.exports = {
  customIdStart: 'totusuna:report:',
  handle: actualHandler,
};

  await safeReply(interaction, {
    embeds: [embed],
    ephemeral: true,
  });


module.exports = {
  customIdStart: 'totusuna:report:',
  handle: actualHandler,
};