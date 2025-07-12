/**
 * 謖・ｮ壹＆繧後◆繝｡繝ｳ繝舌・縺後∥dminRoleIds 縺ｮ縺・★繧後°繧呈戟縺､縺狗｢ｺ隱・ * @param {import('discord.js').GuildMember} member
 * @param {string[]} adminRoleIds
 * @returns {boolean}
 */
function checkAdmin(member, adminRoleIds = []) {
  if (!member || !member.roles || !Array.isArray(adminRoleIds)) return false;
  return member.roles.cache.some(role => adminRoleIds.includes(role.id));
}

module.exports = checkAdmin;
