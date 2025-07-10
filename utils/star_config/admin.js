// utils/star_config/admin.js
const fs = require('fs');
const path = require('path');

/**
 * 指定メンバーが /star管理bot設定 で設定された「いずれかの管理者ロール」を持っているか確認する
 * @param {GuildMember | CommandInteraction} input - DiscordのメンバーオブジェクトまたはInteraction
 * @returns {boolean}
 */
function isAdmin(input) {
  const member = input.member ?? input; // Interaction または GuildMember に対応
  const guildId = member.guild.id;
  const configPath = path.resolve(__dirname, `../../data/${guildId}/${guildId}.json`);

  try {
    if (!fs.existsSync(configPath)) return false;

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const adminRoleIds = config?.star_config?.adminRoleIds;

    if (!Array.isArray(adminRoleIds) || adminRoleIds.length === 0) return false;

    // ロールのいずれかが一致すればOK
    return member.roles.cache.some(role => adminRoleIds.includes(role.id));
  } catch (err) {
    console.error(`❌ 管理者ロール判定エラー (${guildId}):`, err);
    return false;
  }
}

module.exports = isAdmin;
