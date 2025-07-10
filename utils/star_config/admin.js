// utils/star_config/admin.js
const fs = require('fs');
const path = require('path');

/**
 * ユーザーが管理者かどうかを判定
 * @param {GuildMember} member DiscordのGuildMemberオブジェクト
 * @returns {boolean}
 */
function isAdmin(member) {
  const guildId = member.guild.id;
  const configPath = path.join(__dirname, `../../data/${guildId}/${guildId}.json`);

  if (!fs.existsSync(configPath)) return false;

  const json = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  const adminRoleId = json?.starConfig?.adminRoleId;
  if (!adminRoleId) return false;

  return member.roles.cache.has(adminRoleId);
}

module.exports = { isAdmin };
