// utils/star_config/selects/star_admin_role_select.js .js
const fs = require('fs');
const path = require('path');

/**
 * 管理者かどうかを判定
 * @param {import('discord.js').Interaction} interaction
 * @returns {boolean}
 */
function isAdmin(interaction) {
  const guildId = interaction.guildId;
  const member = interaction.member;
  if (!guildId || !member) return false;

  const filePath = path.join(__dirname, '../../data', guildId, `${guildId}.json`);
  if (!fs.existsSync(filePath)) return false;

  try {
    const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const adminRoleIds = json.star_config?.adminRoleIds || [];
    return member.roles.cache.some(role => adminRoleIds.includes(role.id));
  } catch (err) {
    console.warn('[isAdmin] JSON読み込み失敗:', err);
    return false;
  }
}

module.exports = isAdmin;
