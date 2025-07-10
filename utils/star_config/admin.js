// utils/star_config/admin.js
const fs = require('fs');
const path = require('path');

/**
 * 指定メンバーが /star管理bot設定 で設定された管理者ロールのいずれかを持っているか確認する
 * @param {GuildMember|CommandInteraction} input - Discordのメンバーまたはinteractionオブジェクト
 * @returns {boolean}
 */
function isAdmin(input) {
  const member = input.member ?? input; // interaction か member を受け取る想定
  const guildId = member.guild.id;
  const configPath = path.resolve(__dirname, `../../data/${guildId}/${guildId}.json`);

  try {
    if (!fs.existsSync(configPath)) return false;

    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

    // star_config.adminRoleIds に配列として保存されている想定
    const adminRoleIds = config?.star_config?.adminRoleIds;

    if (!Array.isArray(adminRoleIds) || adminRoleIds.length === 0) return false;

    // いずれかのロールが一致すればtrue
    return member.roles.cache.some(role => adminRoleIds.includes(role.id));
  } catch (err) {
    console.error(`❌ 管理者判定エラー (${guildId}):`, err);
    return false;
  }
}

module.exports = isAdmin;
