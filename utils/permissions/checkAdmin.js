// utils/permissions/checkAdmin.js

const { configManager } = require('../configManager');

/**
 * Checks if the interacting user has admin permissions.
 * This includes Discord's Administrator permission or a configured admin role.
 * @param {import('discord.js').Interaction} interaction
 * @returns {Promise<boolean>} True if the user is an admin, false otherwise.
 */
async function checkAdmin(interaction) {
  if (!interaction.inGuild() || !interaction.member) {
    // Cannot check permissions outside of a guild context.
    return false;
  }
  try {
    return await configManager.isStarAdmin(interaction.guildId, interaction.member);
  } catch (err) {
    console.error(`❌ [checkAdmin] Error during permission check for user ${interaction.user.id} in guild ${interaction.guildId}:`, err);
    return false; // Fail safely
  }
}

module.exports = { checkAdmin };
