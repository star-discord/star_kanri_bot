// utils/star_config/admin.js
const fs = require('fs');
const path = require('path');

/**
 * 指定メンバーが管理者ロールを持っているか確認する
 * @param {GuildMember} member - Discordのメンバーオブジェクト
 * @returns {boolean}
 */
function isAdmin(member) {
  const guildId = member.guild.id;
  const configPath = path.resolve(__dirname, `../../data/${guildId}/admin_roles.json`);

  try {
    if (!fs.existsSync(configPath)) return false;

    const configRaw = fs.readFileSync(configPath, 'utf-8');
    const config = JSON.parse(configRaw);
    const adminRoleIds = config.adminRoleIds || [];

    return member.roles.cache.some(role => adminRoleIds.includes(role.id));
  } catch (err) {
    console.error(`❌ 管理者判定エラー: ${guildId}`, err);
    return false;
  }
}

module.exports = isAdmin;
