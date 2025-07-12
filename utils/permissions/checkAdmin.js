/**
 * 持E��されたメンバ�Eが、adminRoleIds のぁE��れかを持つか確誁E * @param {import('discord.js').GuildMember} member
 * @param {string[]} adminRoleIds
 * @returns {boolean}
 */
function checkAdmin(member, adminRoleIds = []) {
  if (!member || !member.roles || !Array.isArray(adminRoleIds)) return false;
  return member.roles.cache.some(role => adminRoleIds.includes(role.id));
}

module.exports = checkAdmin;
