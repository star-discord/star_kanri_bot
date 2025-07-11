const fs = require('fs');
const path = require('path');

/**
 * 管理者かどうかを判定（同期版）
 * @param {import('discord.js').CommandInteraction | import('discord.js').AnySelectMenuInteraction | import('discord.js').ButtonInteraction} interaction
 * @returns {boolean}
 */
function isAdmin(interaction) {
  const guildId = interaction.guildId;
  const member = interaction.member;
  if (!guildId || !member) return false;

  const filePath = path.join(__dirname, '../../data', guildId, `${guildId}.json`);
  if (!fs.existsSync(filePath)) return false;

  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const adminRoleIds = data.star_config?.adminRoleIds || [];
    return member.roles.cache.some(role => adminRoleIds.includes(role.id));
  } catch (err) {
    console.warn('[isAdmin] JSON読み込みエラー:', err);
    return false;
  }
}

module.exports = isAdmin;

