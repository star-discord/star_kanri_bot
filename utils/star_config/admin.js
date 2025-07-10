module.exports = function isAdmin(member, adminRoleIds) {
  return member.roles.cache.some(role => adminRoleIds.includes(role.id));
};
