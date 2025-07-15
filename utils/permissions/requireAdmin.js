// utils/permissions/requireAdmin.js
const { checkAdmin } = require('./checkAdmin');
const { createAdminRejectEmbed } = require('../embedHelper');

/**
 * A higher-order function (wrapper) that protects an interaction handler
 * by ensuring the user has admin permissions before execution.
 * @param {function} handler The interaction handler to execute if the user is an admin.
 * @returns {function} The wrapped interaction handler that includes the permission check.
 */
function requireAdmin(handler) {
  return async (interaction, ...args) => {
    const isAdmin = await checkAdmin(interaction);
    if (!isAdmin) {
      const rejectEmbed = createAdminRejectEmbed();
      // Use editReply if already deferred/replied, otherwise reply.
      return interaction.replied || interaction.deferred
        ? interaction.editReply({ embeds: [rejectEmbed], ephemeral: true })
        : interaction.reply({ embeds: [rejectEmbed], ephemeral: true });
    }
    return handler(interaction, ...args);
  };
}

module.exports = requireAdmin;