// utils/star_config/admin.js
const fs = require('fs');
const { readJSON, ensureGuildJSON } = require('../fileHelper');

/**
 * 指定メンバーが star_config.adminRoleIds のいずれかのロールを持つかを判定
 * @param {import('discord.js').GuildMember | import('discord.js').CommandInteraction} input
 * @returns {boolean}
 */
function isAdmin(input) {
  const member = input.member ?? input; // interaction or member
  if (!member || !member.roles || !member.guild) return false;

  const guildId = member.guild.id;
  const jsonPath = ensureGuildJSON(guildId);
  const config = readJSON(jsonPath);

  const adminRoleIds = config?.star_config?.adminRoleIds;
  if (!Array.isArray(adminRoleIds)) return false;

  return member.roles.cache.some(role => adminRoleIds.includes(role.id));
}

module.exports = isAdmin;

