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

  // interaction.memberがnullまたはundefinedの場合、権限チェックは不可能
  if (!interaction.member) {
    logger.warn(`[checkAdmin] Could not check permissions for a user who is not a guild member.`, {
      guildId: interaction.guildId,
      user: interaction.user.tag,
    });
    return false;
  }

  // Discordのサーバー管理者は、設定に関わらず常に管理者とみなす。
  // これにより、設定ファイルへのアクセスを不要にし、パフォーマンスを向上させ、
  // 設定ミスがあっても管理者が操作できることを保証します。
  if (interaction.member.permissions.has('Administrator')) {
    return true;
  }

  try {
    // Logic moved from configManager.isStarAdmin
    const config = await configManager.getSectionConfig(interaction.guildId, 'star');
    const adminRoleIds = config.adminRoleIds ?? [];

    // adminRoleIdsが配列であることを保証
    if (!Array.isArray(adminRoleIds)) {
      logger.warn(`[checkAdmin] adminRoleIds is not an array.`, {
        guildId: interaction.guildId,
        type: typeof adminRoleIds,
      });
      // 設定が不正な場合は、追加の管理者ロールはなしとみなし、falseを返す
      return false;
    }

    return adminRoleIds.some(roleId => interaction.member.roles.cache.has(roleId));
  } catch (error) {
    logger.error(`[checkAdmin] 設定ファイルに基づく権限チェック中にエラーが発生しました。`, {
      guildId: interaction.guildId,
      user: interaction.user.tag,
      errorMessage: error.message,
      errorStack: error.stack,
      errorObject: JSON.stringify(error, Object.getOwnPropertyNames(error)),
    });
    // エラー発生時は安全のため権限なしとみなす
    return false;
  }
}

module.exports = { checkAdmin };