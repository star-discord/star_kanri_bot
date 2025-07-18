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
    // DMからのコマンドは管理者権限を持ち得ない
    return false;
  }

  try {
    return await configManager.isStarAdmin(interaction.guildId, interaction.member);
  } catch (error) {
    console.error(`[checkAdmin] 権限チェック中にエラーが発生しました (Guild: ${interaction.guildId}, User: ${interaction.user.tag}):`, error);
    // エラー発生時は安全のため権限なしとみなす
    return false;
  }
}

module.exports = { checkAdmin };