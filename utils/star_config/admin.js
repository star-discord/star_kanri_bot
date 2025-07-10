// utils/star_config/admin.js
const fs = require('fs');
const path = require('path');

/**
 * 対象のメンバーが管理者ロールを所持しているか判定
 * @param {GuildMember} member - Discordのメンバーオブジェクト
 * @returns {boolean}
 */
function isAdmin(member) {
  const guildId = member.guild.id;
  const configPath = path.join(__dirname, `../../data/${guildId}/admin_roles.json`);

  if (!fs.existsSync(configPath)) return false;

  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  const adminRoleIds = config.adminRoleIds || [];

  return member.roles.cache.some(role => adminRoleIds.includes(role.id));
}

module.exports = isAdmin;
