// utils/permissions/requireAdmin.js
const { checkAdmin } = require('./checkAdmin');
const { createAdminRejectEmbed } = require('../embedHelper');

/**
 * A higher-order function that wraps a command's execute function
 * to ensure only administrators can run it.
 * @param {(interaction: import('discord.js').Interaction) => Promise<void>} commandExecute The original execute function of the command.
 * @returns {(interaction: import('discord.js').Interaction) => Promise<void>} A new execute function with an admin check.
 */
function requireAdmin(commandExecute) {
  return async function (interaction) {
    const isAdmin = await checkAdmin(interaction);
    if (!isAdmin) {
      return interaction.reply({
        embeds: [createAdminRejectEmbed()],
        ephemeral: true,
      }).catch(() => {}); // Ignore errors if interaction is no longer valid
    }
    await commandExecute(interaction);
  };
}

module.exports = requireAdmin;