// utils/permissions/checkAdmin.js
const { configManager } = require('../configManager');

/**
 * Checks if the interaction user is an administrator.
 * An admin is someone with the 'Administrator' permission or a role configured in star_config.
 * @param {import('discord.js').Interaction} interaction
 * @returns {Promise<boolean>}
 */
async function checkAdmin(interaction) {
  if (!interaction.inGuild()) {
    return false; // Admin commands are guild-only
  }
  return configManager.isStarAdmin(interaction.guildId, interaction.member);
}

module.exports = { checkAdmin };