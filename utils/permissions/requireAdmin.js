// utils/permissions/requireAdmin.js
const { checkAdmin } = require('./checkAdmin');
const { createAdminRejectEmbed } = require('../embedHelper');
const { safeReply } = require('../safeReply');

/**
 * A higher-order function (wrapper) that protects an interaction handler
 * by ensuring the user has admin permissions before execution.
 * @param {function} handler The interaction handler to execute if the user is an admin.
 * @returns {function(import('discord.js').Interaction, ...any): Promise<void>} The wrapped interaction handler.
 */
function requireAdmin(handler) {
  return async (interaction, ...args) => {
    const isAdmin = await checkAdmin(interaction);

    if (!isAdmin) {
      // 権限がない場合は、安全に応答して処理を終了する
      return await safeReply(interaction, {
        embeds: [createAdminRejectEmbed()],
        ephemeral: true,
      });
    }
    // 権限がある場合は、後続のハンドラに処理を完全に委譲する
    return handler(interaction, ...args);
  };
}

module.exports = requireAdmin;