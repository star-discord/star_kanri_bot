const { EmbedBuilder, DiscordAPIError } = require('discord.js');
const { safeReply } = require('./safeReply');
const logger = require('./logger');
const { v4: uuidv4 } = require('uuid');

/**
 * Logs an error and replies to the interaction with a user-friendly message.
 * @param {import('discord.js').Interaction} interaction The interaction that caused the error.
 * @param {Error|string} error The error object or a string message.
 * @param {string} userMessage The generic message to show to the user.
 */
async function logAndReplyError(interaction, error, userMessage) {
  const errorId = uuidv4();
  const actualError = error instanceof Error ? error : new Error(String(error));

  const interactionDetails = {
    errorId,
    guildId: interaction.guild?.id,
    channelId: interaction.channel?.id,
    userId: interaction.user?.id,
    commandName: interaction.isCommand() ? interaction.commandName : 'N/A',
    customId:
      interaction.isMessageComponent() || interaction.isModalSubmit()
        ? interaction.customId
        : 'N/A',
  };

  // Log detailed error information
  if (actualError instanceof DiscordAPIError) {
    logger.error('Discord API Error', {
      ...interactionDetails,
      message: actualError.message,
      code: actualError.code,
      status: actualError.status,
      method: actualError.method,
      url: actualError.url,
      stack: actualError.stack,
    });
  } else {
    logger.error('Unhandled Error', {
      ...interactionDetails,
      message: actualError.message,
      stack: actualError.stack,
    });
  }

  // Create a user-friendly embed
  const errorEmbed = new EmbedBuilder()
    .setColor(0xff0000) // Red
    .setTitle('❌ エラーが発生しました')
    .setDescription(userMessage)
    .setFooter({ text: `サポートが必要な場合は、このIDをお知らせください: ${errorId}` });

  await safeReply(interaction, {
    embeds: [errorEmbed],
    ephemeral: true,
  });
}

module.exports = {
  logAndReplyError,
};
