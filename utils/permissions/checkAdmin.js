// utils/permissions/checkAdmin.js
const { configManager } = require('../configManager');
const logger = require('../logger');

/**
 * Checks if the interaction user is an administrator.
 * An admin is someone with the 'Administrator' permission or a role configured in star_config.
 * @param {import('discord.js').Interaction} interaction
 * @returns {Promise<boolean>}
 */
async function checkAdmin(interaction) {
  if (!interaction.inGuild()) {
    // DMからのコマンドは管理者権限を持ち得ない
    return false;
  }

  try {
    // Logic moved from configManager.isStarAdmin
    const config = await configManager.getSectionConfig(interaction.guildId, 'star');
    const adminRoleIds = config.adminRoleIds ?? [];

    return interaction.member.permissions.has('Administrator') ||
           adminRoleIds.some(roleId => interaction.member.roles.cache.has(roleId));
  } catch (error) {
    logger.error(`[checkAdmin] 権限チェック中にエラーが発生しました`, {
      guildId: interaction.guildId,
      user: interaction.user.tag,
      error,
    });
    // エラー発生時は安全のため権限なしとみなす
    return false;
  }
}

module.exports = { checkAdmin };