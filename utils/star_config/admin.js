// utils/star_config/admin.js
const fs = require('fs');
const { ensureGuildJSON } = require('../fileHelper');

/**
 * 指定メンバーが star_config.adminRoleIds のいずれかのロールを持つかを判定
 * @param {import('discord.js').GuildMember | import('discord.js').CommandInteraction} input
 * @returns {boolean}
 */
function isAdmin(input) {
  const member = input.member ?? input; // CommandInteraction or GuildMember
  const guildId = member.guild.id;

  const jsonPath = ensureGuildJSON(guildId);
  if (!fs.existsSync(jsonPath)) return false;

  try {
    const config = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const adminRoleIds = config?.star_config?.adminRoleIds;

    if (!Array.isArray(adminRoleIds)) return false;

    return member.roles.cache.some(role => adminRoleIds.includes(role.id));
  } catch (err) {
    console.error(`❌ 管理者判定エラー (${guildId}):`, err);
    return false;
  }
}

module.exports = isAdmin;
